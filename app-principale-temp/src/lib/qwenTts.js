// ── Qwen3-TTS via proxy backend /api/ai/tts ──────────────────────────────────
// Model: qwen3-tts-flash — multilingue (zh, en, ja, ko, de, fr, ru, pt, es, it)
// Docs: https://github.com/QwenLM/Qwen3-TTS
//
// La clé DashScope reste côté serveur (DASHSCOPE_API_KEY dans les env Vercel).
// Aucune clé n'est exposée au navigateur.

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

// ── Vérification de disponibilité (mise en cache pour la session) ───────────
let availabilityCache = null;

export async function checkQwenTtsAvailable() {
  if (availabilityCache !== null) return availabilityCache;
  try {
    const res = await fetch(`${API_BASE}/api/ai/tts`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    availabilityCache = !!data.available;
  } catch {
    availabilityCache = false;
  }
  return availabilityCache;
}

// ── Détection de langue heuristique (texte court de conversation) ────────────
const STOPWORDS = {
  fr: [' le ', ' la ', ' les ', ' des ', ' une ', ' est ', ' vous ', ' tu ', ' avec ', ' pour ', ' dans ', ' sur ', ' votre ', ' cheveux ', ' merci ', ' bonjour ', ' très ', ' être ', ' faire '],
  en: [' the ', ' and ', ' is ', ' are ', ' you ', ' your ', ' with ', ' for ', ' this ', ' that ', ' have ', ' hair ', ' thanks ', ' hello ', ' really ', ' what '],
  es: [' el ', ' la ', ' los ', ' las ', ' de ', ' es ', ' usted ', ' con ', ' para ', ' cabello ', ' gracias ', ' hola ', ' muy ', ' qué '],
  de: [' der ', ' die ', ' das ', ' und ', ' ist ', ' sie ', ' du ', ' mit ', ' für ', ' haar ', ' danke ', ' hallo ', ' nicht '],
  it: [' il ', ' la ', ' di ', ' che ', ' è ', ' tu ', ' lei ', ' con ', ' per ', ' capelli ', ' grazie ', ' ciao ', ' non '],
  pt: [' o ', ' a ', ' de ', ' que ', ' é ', ' você ', ' com ', ' para ', ' cabelo ', ' obrigado ', ' olá ', ' não '],
};

export function detectLanguage(text) {
  if (!text) return 'fr';
  if (/[一-鿿]/.test(text)) return 'zh';
  if (/[぀-ヿ]/.test(text)) return 'ja';
  if (/[가-힯]/.test(text)) return 'ko';
  if (/[؀-ۿ]/.test(text)) return 'ar';
  if (/[Ѐ-ӿ]/.test(text)) return 'ru';

  const t = ` ${text.toLowerCase()} `;
  let best = 'fr', bestScore = 0;
  for (const [lang, words] of Object.entries(STOPWORDS)) {
    let score = 0;
    for (const w of words) if (t.includes(w)) score++;
    if (score > bestScore) { bestScore = score; best = lang; }
  }
  return best;
}

// Code BCP47 pour le fallback Web Speech API
export const LANG_TO_BCP47 = {
  fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT',
  pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA', ru: 'ru-RU',
};

// Libellé de langue pour les prompts (adapter la réponse à la langue utilisateur)
export const LANG_LABEL = {
  fr: 'français', en: 'anglais', es: 'espagnol', de: 'allemand', it: 'italien',
  pt: 'portugais', zh: 'chinois', ja: 'japonais', ko: 'coréen', ar: 'arabe', ru: 'russe',
};

// ── Synthèse vocale Qwen3-TTS ────────────────────────────────────────────────
// Retourne une objectURL audio (mp3) ou null si indisponible/échec.
export async function synthesizeQwenTTS(text, lang = 'fr') {
  if (!text) return null;

  const clean = text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '')
    .replace(/`[^`]+`/g, '').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 600);
  if (!clean) return null;

  try {
    const url = `${API_BASE}/api/ai/tts`;
    console.log('[Qwen3-TTS] Calling:', url, 'text length:', clean.length);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Qwen3-TTS détecte la langue automatiquement ; lang envoyé à titre informatif
      body: JSON.stringify({ text: clean, lang }),
    });

    console.log('[Qwen3-TTS] Response:', res.status, res.statusText, 'content-type:', res.headers.get('content-type'));
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Qwen3-TTS] API returned ${res.status}:`, errText.slice(0, 200));
      return null;
    }

    const blob = await res.blob();
    console.log('[Qwen3-TTS] Blob size:', blob.size, 'bytes');
    if (!blob || blob.size < 100) return null;
    const mime = res.headers.get('content-type') || 'audio/wav';
    return URL.createObjectURL(new Blob([blob], { type: mime.split(';')[0] }));
  } catch (err) {
    console.warn('[Qwen3-TTS] Synthesis failed:', err.message);
    return null;
  }
}
