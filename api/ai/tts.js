// ── Qwen3-TTS via Alibaba Cloud DashScope (proxy sécurisé) ──────────────────
// Model: qwen3-tts-flash — multilingue (zh, en, ja, ko, de, fr, ru, pt, es, it)
// Docs: https://github.com/QwenLM/Qwen3-TTS
//
// La clé API reste côté serveur. Configuration (Vercel env ou .env local) :
//   DASHSCOPE_API_KEY=sk-...         Clé API Alibaba Cloud Model Studio
//   DASHSCOPE_BASE_URL=...           (optionnel, défaut: endpoint international)
//   QWEN_TTS_MODEL=qwen3-tts-flash   (optionnel)
//   QWEN_TTS_VOICE=Cherry            (optionnel : Cherry, Serena, Ethan, Chelsie...)
//
// GET  /api/ai/tts           → { available, model, voice }
// POST /api/ai/tts { text }  → audio/wav (flux binaire)

const DASHSCOPE_BASE = process.env.DASHSCOPE_BASE_URL
  || 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const QWEN_TTS_MODEL = process.env.QWEN_TTS_MODEL || 'qwen3-tts-flash';
const QWEN_TTS_VOICE = process.env.QWEN_TTS_VOICE || 'Cherry';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Statut de disponibilité (pour l'indicateur UI) ──────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({
      available: !!process.env.DASHSCOPE_API_KEY,
      model: QWEN_TTS_MODEL,
      voice: QWEN_TTS_VOICE,
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Qwen3-TTS non configuré (DASHSCOPE_API_KEY manquante)' });

  const { text } = req.body || {};
  const clean = String(text || '').trim().slice(0, 600);
  if (!clean) return res.status(400).json({ error: 'Missing text' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    // 1. Appel DashScope natif → retourne l'URL d'un fichier audio temporaire
    const dsRes = await fetch(DASHSCOPE_BASE, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: QWEN_TTS_MODEL,
        input: {
          text: clean,
          voice: QWEN_TTS_VOICE,
          language_type: 'Auto', // détection automatique de la langue
        },
      }),
    });

    if (!dsRes.ok) {
      clearTimeout(timeout);
      const errBody = await dsRes.text().catch(() => 'DashScope error');
      console.error(`[api/ai/tts] DashScope ${dsRes.status}:`, errBody.slice(0, 300));
      return res.status(502).json({ error: `DashScope error ${dsRes.status}` });
    }

    const dsData = await dsRes.json();
    const audioUrl = dsData?.output?.audio?.url;
    if (!audioUrl) {
      clearTimeout(timeout);
      console.error('[api/ai/tts] No audio URL:', JSON.stringify(dsData).slice(0, 300));
      return res.status(502).json({ error: 'No audio URL from DashScope' });
    }

    // 2. Télécharger l'audio et le renvoyer au client (URL temporaire non exposée)
    const audioRes = await fetch(audioUrl.replace(/^http:\/\//, 'https://'), { signal: controller.signal });
    clearTimeout(timeout);

    if (!audioRes.ok) return res.status(502).json({ error: `Audio download error ${audioRes.status}` });

    const audio = Buffer.from(await audioRes.arrayBuffer());
    if (audio.length < 100) return res.status(502).json({ error: 'Empty audio from DashScope' });

    // DashScope renvoie du WAV (RIFF)
    const isWav = audio.length > 4 && audio.toString('ascii', 0, 4) === 'RIFF';
    res.setHeader('Content-Type', isWav ? 'audio/wav' : 'audio/mpeg');
    res.setHeader('Content-Length', audio.length);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audio);
  } catch (err) {
    clearTimeout(timeout);
    console.error('[api/ai/tts] Error:', err.message);
    return res.status(err.name === 'AbortError' ? 504 : 500).json({
      error: err.name === 'AbortError' ? 'TTS timeout' : err.message,
    });
  }
}
