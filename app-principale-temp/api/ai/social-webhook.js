// ── Webhook Meta : Maria AI répond aux commentaires/DM et capture les prospects
//
// Configuration (env Vercel) :
//   META_WEBHOOK_VERIFY_TOKEN=...   Token de vérification choisi par vous
//   META_APP_SECRET=...             (recommandé) pour vérifier la signature X-Hub-Signature-256
//   OPENROUTER_KEY=...              Pour la génération des réponses par Maria
//
// URL à déclarer dans Meta for Developers → Webhooks :
//   https://<votre-domaine>/api/ai/social-webhook
//
// Flux : commentaire/DM reçu → retrouve la connexion (social_connection) →
//        Maria génère une réponse (OpenRouter) → publie via Graph API →
//        enregistre l'interaction + crée le prospect (table Client).

import crypto from 'crypto';

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vimusrczrjvefsbljtmf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXVzcmN6cmp2ZWZzYmxqdG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODg1MDksImV4cCI6MjA5NzU2NDUwOX0.2fSiqWfYKs3fadwRkS9Nvdq9b9JqnsmtMTHg-wN5m6k';
const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

// ── Helpers Supabase REST ────────────────────────────────────────────────────
const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function sbSelect(table, query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: sbHeaders });
  if (!r.ok) return [];
  return r.json();
}

async function sbInsert(table, row) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders,
    body: JSON.stringify(row),
  });
  return r.ok;
}

// ── Maria génère la réponse (orientée acquisition client) ───────────────────
async function generateMariaReply(incomingText, context, authorName) {
  const key = process.env.OPENROUTER_KEY;
  if (!key) return null;

  const prompt = `Tu es Maria, l'assistante IA de BeautyBook (plateforme de réservation beauté : coiffure, soins, maquillage).
Un prospect nommé "${authorName}" vient d'écrire ${context} : "${incomingText}"

Rédige UNE réponse courte (1-2 phrases, ton chaleureux et pro), qui :
- répond naturellement à son message,
- l'invite à découvrir/réserver sur BeautyBook si pertinent,
- reste authentique (pas de spam, pas de lien forcé).
Réponds uniquement avec le texte de la réponse, sans guillemets.`;

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://definitif-beta.vercel.app',
        'X-Title': 'BeautyBook Maria Social',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ── Capture du prospect dans le CRM (table Client) ──────────────────────────
async function captureProspect(proEmail, authorName, source, notes) {
  const existing = await sbSelect('Client', `pro_email=eq.${encodeURIComponent(proEmail)}&name=eq.${encodeURIComponent(authorName)}&source=eq.${encodeURIComponent(source)}&limit=1`);
  if (existing.length > 0) return;
  await sbInsert('Client', {
    pro_email: proEmail,
    name: authorName,
    source,
    notes: notes?.slice(0, 500),
    tags: ['prospect-social'],
  });
}

// ── Traitement d'un événement entrant ────────────────────────────────────────
async function processEvent({ platform, externalId, entryId, authorId, authorName, text, type }) {
  if (!text || !externalId) return;

  // Anti-doublon
  const dup = await sbSelect('social_interaction', `platform=eq.${platform}&external_id=eq.${encodeURIComponent(externalId)}&limit=1`);
  if (dup.length > 0) return;

  // Retrouver le propriétaire du compte (IG business id ou Page id = entry.id)
  const idField = platform === 'instagram' ? 'ig_id' : 'page_id';
  const conns = await sbSelect('social_connection', `platform=eq.${platform}&status=eq.active&account_info->>${idField}=eq.${encodeURIComponent(entryId)}&limit=1`);
  const conn = conns[0];
  if (!conn) {
    console.warn(`[social-webhook] Aucune connexion ${platform} pour ${idField}=${entryId}`);
    return;
  }

  // Ne pas se répondre à soi-même
  if (authorName && conn.account_info?.username && authorName === conn.account_info.username) return;
  if (authorId && authorId === entryId) return;

  const token = conn.credentials?.accessToken || conn.credentials?.pageAccessToken;
  if (!token) return;

  const context = type === 'dm' ? 'un message privé' : 'un commentaire sur une publication';
  const reply = await generateMariaReply(text, context, authorName || 'un utilisateur');
  if (!reply) return;

  // Publier la réponse
  let posted = false;
  try {
    if (platform === 'instagram' && type === 'comment') {
      const r = await fetch(`${GRAPH_BASE}/${externalId}/replies?message=${encodeURIComponent(reply)}&access_token=${encodeURIComponent(token)}`, { method: 'POST' });
      posted = r.ok;
      if (!r.ok) console.error('[social-webhook] IG reply error:', (await r.text()).slice(0, 200));
    } else if (platform === 'facebook') {
      const endpoint = type === 'dm'
        ? `${GRAPH_BASE}/me/messages?access_token=${encodeURIComponent(token)}`
        : `${GRAPH_BASE}/${externalId}/comments?access_token=${encodeURIComponent(token)}`;
      const body = type === 'dm'
        ? { recipient: { id: authorId }, messaging_type: 'RESPONSE', message: { text: reply } }
        : { message: reply };
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      posted = r.ok;
      if (!r.ok) console.error('[social-webhook] FB reply error:', (await r.text()).slice(0, 200));
    }
  } catch (e) {
    console.error('[social-webhook] publish error:', e.message);
  }

  if (!posted) return;

  // Journaliser + capturer le prospect
  await sbInsert('social_interaction', {
    platform,
    external_id: externalId,
    user_email: conn.user_email,
    author_name: authorName || 'Inconnu',
    author_id: authorId || null,
    content: text.slice(0, 500),
    reply: reply.slice(0, 500),
    type,
  });
  await captureProspect(conn.user_email, authorName || 'Inconnu', `social_${platform}`, `${type === 'dm' ? 'DM' : 'Commentaire'} : ${text}`);
}

// ── Lecture du raw body (nécessaire pour la vérification de signature) ──────
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // ── 1. Vérification du webhook par Meta (GET) ─────────────────────────────
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verify token mismatch' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 2. Vérification de signature (si META_APP_SECRET configuré) ───────────
  const raw = await readRawBody(req);
  const appSecret = process.env.META_APP_SECRET;
  if (appSecret) {
    const signature = req.headers['x-hub-signature-256'] || '';
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(raw).digest('hex');
    if (signature !== expected) return res.status(401).json({ error: 'Invalid signature' });
  }

  let body;
  try { body = JSON.parse(raw.toString('utf8')); } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Meta exige une réponse 200 rapide — on traite puis on répond
  try {
    for (const entry of body.entry || []) {
      // ── Instagram : commentaires ──
      for (const change of entry.changes || []) {
        if (change.field === 'comments' && change.value?.id && change.value?.text) {
          const v = change.value;
          // Ignorer les réponses à d'autres commentaires pour rester pertinent
          if (v.parent_id) continue;
          await processEvent({
            platform: 'instagram',
            externalId: v.id,
            entryId: entry.id,
            authorId: v.from?.id,
            authorName: v.from?.username,
            text: v.text,
            type: 'comment',
          });
        }
      }
      // ── Facebook/Instagram : messages privés (Messenger) ──
      for (const msg of entry.messaging || []) {
        if (msg.message?.text && !msg.message.is_echo) {
          await processEvent({
            platform: 'facebook',
            externalId: msg.message.mid,
            entryId: entry.id,
            authorId: msg.sender?.id,
            authorName: null,
            text: msg.message.text,
            type: 'dm',
          });
        }
      }
    }
  } catch (e) {
    console.error('[social-webhook] processing error:', e.message);
  }

  return res.status(200).json({ received: true });
}
