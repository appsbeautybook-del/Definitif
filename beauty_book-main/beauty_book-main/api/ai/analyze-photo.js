import { getOpenRouterKey } from '../_lib/config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { photoUrl, productName } = req.body;
  const OPENROUTER_KEY = getOpenRouterKey();

  try {
    const userContent = [];

    if (photoUrl) {
      userContent.push({
        type: 'image_url',
        image_url: { url: photoUrl }
      });
    }

    const prompt = `Tu es un expert en essayage virtuel et analyse de photo pour la mode.
Analyse cette photo utilisateur pour évaluer sa compatibilité avec un essayage virtuel de vêtement.

Vêtement à essayer : ${productName || "vêtement non spécifié"}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "has_person": true,
  "body_visible": true,
  "quality_ok": true,
  "compatibility_score": nombre entre 40 et 98,
  "issues": ["problème éventuel détecté"],
  "body_type": "type de morphologie détecté (si visible)",
  "suggestion": "Conseil pratique pour améliorer la photo d'essayage"
}`;

    userContent.push({ type: 'text', text: prompt });

    const body = JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: userContent }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://definitif-beta.vercel.app',
        'X-Title': 'BeautyBook ShAI',
      },
      body,
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => 'Unknown error');
      return res.status(apiRes.status).json({ error: `OpenRouter error: ${errBody}` });
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content || '';

    try {
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({
        has_person: true,
        body_visible: true,
        quality_ok: true,
        compatibility_score: 80,
        issues: [],
        body_type: "",
        suggestion: "Photo compatible pour l'essayage virtuel."
      });
    }
  } catch (err) {
    console.error('[api/ai/analyze-photo] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
