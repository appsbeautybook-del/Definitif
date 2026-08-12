// ── Validation réelle des identifiants réseaux sociaux ──────────────────────
// POST /api/ai/social { task: 'validate', platform, credentials }
//
// Teste les clés contre les vraies API :
//   Instagram → Graph API Meta (GET /{ig-business-id}?fields=username,...)
//   Facebook  → Graph API Meta (GET /{page-id}?fields=name,fan_count,...)
//   WhatsApp  → Graph API Meta (GET /{phone-number-id}?fields=display_phone_number,...)
//   TikTok    → TikTok API v2  (GET /v2/user/info/)
//
// Retourne { ok: true, account: {...} } ou { ok: false, error: "..." }.

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

const withTimeout = (ms = 15000) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(t) };
};

// Traduit les erreurs Meta/TikTok en message clair pour l'utilisateur
const humanError = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid oauth') || m.includes('access token') && m.includes('invali')) return "Token d'accès invalide ou expiré.";
  if (m.includes('session has expired') || m.includes('expired')) return "Token expiré — générez un nouveau token (idéalement longue durée, 60 jours).";
  if (m.includes('nonexisting field') || m.includes('username')) return "Cet ID n'est pas un compte Instagram Business. Vérifiez le Business Account ID.";
  if (m.includes('does not exist') || m.includes('nonexist') || m.includes('not found')) return "ID introuvable — vérifiez l'identifiant saisi.";
  if (m.includes('permission') || m.includes('(#200') || m.includes('(#10)')) return "Permissions insuffisantes — le token doit inclure instagram_basic / pages_show_list.";
  if (m.includes('rate limit')) return "Trop de requêtes — réessayez dans quelques minutes.";
  return `Erreur API : ${msg.slice(0, 120)}`;
};

async function validateInstagram({ accessToken, businessId }) {
  if (!/^\d{5,}$/.test(businessId || '')) {
    return { ok: false, error: "Le Business Account ID Instagram doit être numérique (ex : 17841400000000000)." };
  }
  const { signal, done } = withTimeout();
  try {
    const r = await fetch(
      `${GRAPH_BASE}/${businessId}?fields=id,username,name,followers_count,media_count&access_token=${encodeURIComponent(accessToken)}`,
      { signal }
    );
    const d = await r.json();
    if (d.error) return { ok: false, error: humanError(d.error.message) };
    if (!d.username) return { ok: false, error: "Ce compte n'est pas un compte Instagram Business/Creator." };
    return {
      ok: true,
      account: {
        ig_id: d.id,
        username: d.username,
        name: d.name || d.username,
        followers_count: d.followers_count ?? null,
        media_count: d.media_count ?? null,
      },
    };
  } finally { done(); }
}

async function validateFacebook({ pageAccessToken, pageId }) {
  if (!/^\d{5,}$/.test(pageId || '')) {
    return { ok: false, error: "Le Page ID Facebook doit être numérique (ex : 123456789012345)." };
  }
  const { signal, done } = withTimeout();
  try {
    const r = await fetch(
      `${GRAPH_BASE}/${pageId}?fields=id,name,fan_count,followers_count&access_token=${encodeURIComponent(pageAccessToken)}`,
      { signal }
    );
    const d = await r.json();
    if (d.error) return { ok: false, error: humanError(d.error.message) };
    if (!d.name) return { ok: false, error: "Page introuvable avec ces identifiants." };
    return {
      ok: true,
      account: {
        page_id: d.id,
        name: d.name,
        username: d.name,
        followers_count: d.followers_count ?? d.fan_count ?? null,
      },
    };
  } finally { done(); }
}

async function validateWhatsapp({ accessToken, phoneNumberId }) {
  if (!/^\d{5,}$/.test(phoneNumberId || '')) {
    return { ok: false, error: "Le Phone Number ID WhatsApp doit être numérique." };
  }
  const { signal, done } = withTimeout();
  try {
    const r = await fetch(
      `${GRAPH_BASE}/${phoneNumberId}?fields=id,display_phone_number,verified_name&access_token=${encodeURIComponent(accessToken)}`,
      { signal }
    );
    const d = await r.json();
    if (d.error) return { ok: false, error: humanError(d.error.message) };
    return {
      ok: true,
      account: {
        phone_number_id: d.id,
        name: d.verified_name || d.display_phone_number,
        username: d.display_phone_number,
      },
    };
  } finally { done(); }
}

async function validateTiktok({ accessToken }) {
  const { signal, done } = withTimeout();
  try {
    const r = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,follower_count',
      { signal, headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const d = await r.json();
    if (d.error?.code && d.error.code !== 'ok') {
      return { ok: false, error: humanError(d.error.message || d.error.code) };
    }
    const u = d.data?.user;
    if (!u?.open_id) return { ok: false, error: "Token TikTok invalide ou expiré." };
    return {
      ok: true,
      account: {
        open_id: u.open_id,
        username: u.display_name,
        name: u.display_name,
        followers_count: u.follower_count ?? null,
      },
    };
  } finally { done(); }
}

const VALIDATORS = {
  instagram: validateInstagram,
  facebook: validateFacebook,
  whatsapp: validateWhatsapp,
  tiktok: validateTiktok,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { task, platform, credentials } = req.body || {};

  if (task !== 'validate') return res.status(400).json({ error: 'Unknown task' });

  const validate = VALIDATORS[platform];
  if (!validate) return res.status(400).json({ ok: false, error: 'Plateforme inconnue.' });

  const required = {
    instagram: ['accessToken', 'businessId'],
    facebook: ['pageAccessToken', 'pageId'],
    whatsapp: ['accessToken', 'phoneNumberId'],
    tiktok: ['accessToken'],
  }[platform];

  for (const key of required) {
    const v = credentials?.[key];
    if (!v || !String(v).trim()) return res.status(400).json({ ok: false, error: `Champ manquant : ${key}` });
    if (String(v).trim().length < 8 && key.toLowerCase().includes('token')) {
      return res.status(400).json({ ok: false, error: "Le token saisi est trop court pour être valide." });
    }
  }

  try {
    const result = await validate(credentials);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[api/ai/social] validate error:', err.message);
    return res.status(200).json({
      ok: false,
      error: err.name === 'AbortError' ? "Délai dépassé — vérifiez votre connexion." : `Erreur : ${err.message}`,
    });
  }
}
