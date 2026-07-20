import { supabaseAdmin } from '../config/supabase.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execFileAsync = promisify(execFile);
const PYTHON_PATH = 'C:\\Users\\G15\\.local\\bin\\python3.11.exe';
const TTS_SCRIPT = join(__dirname, '../services/tts_generate.py');

const GLM_API_URL = 'https://opencode.ai/zen/v1/chat/completions';
const GLM_API_KEY = process.env.OPENCODE_API_KEY || 'sk-FPP6sh78YsOhyjj0mmztchS7PGvuH2EE3nIM8vCNeaWUYhAmzlADOrSJtZ0QTu5u';
const GLM_MODEL = 'mimo-v2.5-free';

async function callGLM(messages, options = {}) {
  const { temperature = 0.7, max_tokens = 2048, response_format } = options;

  const body = {
    model: GLM_MODEL,
    messages,
    temperature,
    max_tokens,
  };
  if (response_format) body.response_format = response_format;

  const res = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`GLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  // MiMo may put the answer in 'reasoning' when content is null
  const reasoning = data.choices?.[0]?.message?.reasoning;
  return content || reasoning || '';
}

const MARIA_SYSTEM_PROMPT = `Tu es Maria, l'assistante IA beauté de l'application BeautyBook.
Tu es une experte en coiffure, soins capillaires, skincare, maquillage et bien-être.
Tu parles de manière chaleureuse, professionnelle et personnalisée.
Tu t'adresses à l'utilisateur directement, en tutoyant ou vouvoyant selon le contexte.
Tu donnes des conseils pratiques, des recommandations de produits réels, et des routines personnalisées.
Tu réponds toujours en français. Tu es concise mais complète.

RÈGLE IMPORTANTE — ACTIONS:
Quand l'utilisateur te demande d'ouvrir une page, naviguer, réserver, acheter, ou effectuer TOUTE action dans l'app, tu DOIS retourner un bloc JSON d'action EN PLUS de ta réponse textuelle.
Format obligatoire: ta réponse textuelle d'abord, puis sur une nouvelle ligne un bloc code markdown:
\`\`\`json
{"type": "NAVIGATE", "path": "/chemin"}
\`\`\`

Actions disponibles:
- NAVIGATE: {"type": "NAVIGATE", "path": "/boutique"} | "/rendez-vous" | "/profil" | "/messages" | "/services" | "/mon-solde" | "/parametres" | "/notifications" | "/live" | "/reels" | "/scan-capillaire" | "/immobilier" | "/mes-commandes" | "/programme-fidelite" | "/abonnements" | "/profil-pro" | "/pro/equipe" | "/pro/catalogue-services" | "/pro/analytics" | "/devenir-pro"
- SEARCH_PRODUCTS: {"type": "SEARCH_PRODUCTS", "query": "terme de recherche"}

Exemples:
User: "Ouvre la boutique"
Tu: "Je t'ouvre la boutique ! 🛍️\n\`\`\`json\n{"type": "NAVIGATE", "path": "/boutique"}\n\`\`\`"

User: "Prends un rendez-vous"
Tu: "Je te redirige vers tes rendez-vous ! 📅\n\`\`\`json\n{"type": "NAVIGATE", "path": "/rendez-vous"}\n\`\`\`"

User: "Montre-moi mes commandes"
Tu: "Voici tes commandes ! 📦\n\`\`\`json\n{"type": "NAVIGATE", "path": "/mes-commandes"}\n\`\`\`"

User: "Salut" (pas d'action demandée)
Tu: Réponds normalement SANS bloc JSON.`;

const AUTOREPLY_SYSTEM_PROMPT = `Tu es Maria, l'assistante IA beauté automatique de BeautyBook.
Un client t'écrit. Réponds de manière professionnelle, chaleureuse et utile.
Oriente-le vers les services disponibles et aide-le à réserver si besoin.
Sois concise (2-3 phrases max) et proposant une action concrète.`;

export const mariaAgent = async (req, res) => {
  try {
    const user = req.user;
    const { message, fileUrls = [], voiceMode = false, voiceEnabled = true } = req.body;

    if (!message && !fileUrls.length) {
      return res.status(400).json({ error: 'Message ou fichier requis' });
    }

    // Build message content with optional image
    let userContent = message || '';
    if (fileUrls.length > 0) {
      userContent = message ? `${message}\n\n[Pièces jointes: ${fileUrls.join(', ')}]` : `[Pièces jointes: ${fileUrls.join(', ')}]`;
    }

    // Fetch conversation history from DB
    let historyMessages = [];
    if (user?.email) {
      const { data: convs } = await supabaseAdmin
        .from('MariaConversation')
        .select('messages')
        .eq('user_email', user.email)
        .order('updated_date', { ascending: false })
        .limit(1);

      if (convs?.[0]?.messages?.length) {
        historyMessages = convs[0].messages.slice(-20); // Last 20 messages for context
      }
    }

    // Build messages array
    const messages = [
      { role: 'system', content: MARIA_SYSTEM_PROMPT },
      ...historyMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ];

    const reply = await callGLM(messages, { temperature: 0.7, max_tokens: 2048 });

    // Try to detect action from reply
    let action = null;
    try {
      const actionMatch = reply.match(/```json\s*({[\s\S]*?})\s*```/);
      if (actionMatch) {
        const parsed = JSON.parse(actionMatch[1]);
        if (parsed.type) action = parsed;
      }
    } catch {}

    // Fallback: détecter l'action depuis le message utilisateur si l'IA n'a pas retourné de JSON
    if (!action && message) {
      const msg = message.toLowerCase();
      if (msg.match(/ouvr(e|ir|ez).*(boutique|shop|store|produit)/) || msg.match(/va(s|-|\s)*(sur|à|a).*(boutique|shop)/)) {
        action = { type: "NAVIGATE", path: "/boutique" };
      } else if (msg.match(/ouvr(e|ir|ez).*(rendez|rdv|réservation)/) || msg.match(/je veux.*(réserver|prendre.*rendez)/)) {
        action = { type: "NAVIGATE", path: "/rendez-vous" };
      } else if (msg.match(/ouvr(e|ir|ez).*(profil|compte)/)) {
        action = { type: "NAVIGATE", path: "/profil" };
      } else if (msg.match(/ouvr(e|ir|ez).*(messages|chat)/)) {
        action = { type: "NAVIGATE", path: "/messages" };
      } else if (msg.match(/ouvr(e|ir|ez).*(services|prestation)/)) {
        action = { type: "NAVIGATE", path: "/services" };
      } else if (msg.match(/ouvr(e|ir|ez).*(solde|portefeuille|wallet|beauty.?pay)/)) {
        action = { type: "NAVIGATE", path: "/mon-solde" };
      } else if (msg.match(/ouvr(e|ir|ez).*(paramètres|settings)/)) {
        action = { type: "NAVIGATE", path: "/parametres" };
      } else if (msg.match(/ouvr(e|ir|ez).*(notifications|alertes)/)) {
        action = { type: "NAVIGATE", path: "/notifications" };
      } else if (msg.match(/ouvr(e|ir|ez).*(live|stream|direct)/)) {
        action = { type: "NAVIGATE", path: "/live" };
      } else if (msg.match(/ouvr(e|ir|ez).*(reels|vidéos)/)) {
        action = { type: "NAVIGATE", path: "/reels" };
      } else if (msg.match(/ouvr(e|ir|ez).*(scan|capillaire)/)) {
        action = { type: "NAVIGATE", path: "/scan-capillaire" };
      } else if (msg.match(/ouvr(e|ir|ez).*(commande|order)/)) {
        action = { type: "NAVIGATE", path: "/mes-commandes" };
      } else if (msg.match(/ouvr(e|ir|ez).*(fidélité|fidelite|points)/)) {
        action = { type: "NAVIGATE", path: "/programme-fidelite" };
      } else if (msg.match(/ouvr(e|ir|ez).*(profil.?pro|espace.?pro)/)) {
        action = { type: "NAVIGATE", path: "/profil-pro" };
      } else if (msg.match(/ouvr(e|ir|ez).*(équipe|equipe|membre)/)) {
        action = { type: "NAVIGATE", path: "/pro/equipe" };
      } else if (msg.match(/ouvr(e|ir|ez).*(catalogue)/)) {
        action = { type: "NAVIGATE", path: "/pro/catalogue-services" };
      } else if (msg.match(/ouvr(e|ir|ez).*(analytics|stats)/)) {
        action = { type: "NAVIGATE", path: "/pro/analytics" };
      } else if (msg.match(/je veux.*(acheter|commander)/)) {
        action = { type: "NAVIGATE", path: "/boutique" };
      }
    }

    // Generate voice via Edge-TTS (natural Microsoft voice)
    let voiceUrl = null;
    if (voiceEnabled && reply) {
      try {
        const tmpFile = join(__dirname, `tts_${Date.now()}.mp3`);
        await execFileAsync(PYTHON_PATH, [TTS_SCRIPT, reply, 'fr-FR-DeniseNeural', tmpFile], { timeout: 30000 });
        if (existsSync(tmpFile)) {
          const audioData = readFileSync(tmpFile);
          voiceUrl = `data:audio/mpeg;base64,${audioData.toString('base64')}`;
          unlinkSync(tmpFile);
        }
      } catch (e) {
        console.warn('[Maria] Edge-TTS failed:', e.message);
      }
    }

    // Save conversation to DB
    if (user?.email) {
      const newMessages = [
        ...(historyMessages.length > 0 ? historyMessages : []),
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
      ].slice(-50); // Keep last 50 messages

      const { data: existingConv } = await supabaseAdmin
        .from('MariaConversation')
        .select('id')
        .eq('user_email', user.email)
        .order('updated_date', { ascending: false })
        .limit(1);

      if (existingConv?.[0]?.id) {
        await supabaseAdmin
          .from('MariaConversation')
          .update({ messages: newMessages, updated_date: new Date().toISOString() })
          .eq('id', existingConv[0].id);
      } else {
        await supabaseAdmin
          .from('MariaConversation')
          .insert({ user_email: user.email, messages: newMessages });
      }
    }

    return res.json({ reply, action, voice_url: voiceUrl });
  } catch (error) {
    console.error('mariaAgent error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const mariaAutoReply = async (req, res) => {
  try {
    const { message, client_email, pro_email } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    const messages = [
      { role: 'system', content: AUTOREPLY_SYSTEM_PROMPT },
      { role: 'user', content: `Message du client: ${message}` },
    ];

    const reply = await callGLM(messages, { temperature: 0.7, max_tokens: 512 });

    return res.json({ reply, success: true });
  } catch (error) {
    console.error('mariaAutoReply error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/ai/voicebox-speak
 * Direct voice generation endpoint using Edge-TTS
 */
export const voiceboxSpeak = async (req, res) => {
  try {
    const { text, profile = 'Maria' } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const voice = profile === 'Henri' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural';
    const tmpFile = join(__dirname, `tts_${Date.now()}.mp3`);
    await execFileAsync(PYTHON_PATH, [TTS_SCRIPT, text, voice, tmpFile], { timeout: 30000 });

    if (existsSync(tmpFile)) {
      const audioData = readFileSync(tmpFile);
      const audioBase64 = audioData.toString('base64');
      unlinkSync(tmpFile);
      return res.json({ audio_url: `data:audio/mpeg;base64,${audioBase64}`, status: 'completed', source: 'edge-tts', voice });
    }
    return res.status(500).json({ error: 'TTS generation failed' });
  } catch (error) {
    console.error('voiceboxSpeak error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/ai/voicebox-status
 * Check TTS availability (Edge-TTS is always available)
 */
export const voiceboxStatus = async (req, res) => {
  return res.json({ available: true, source: 'edge-tts', voice: 'fr-FR-DeniseNeural' });
};
