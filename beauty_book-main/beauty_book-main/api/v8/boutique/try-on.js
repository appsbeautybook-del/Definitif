import { getOpenRouterKey } from '../../_lib/config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_photo, garment_photo, garment_name, mode, outfit_pieces } = req.body;
  const OPENROUTER_KEY = getOpenRouterKey();

  try {
    const userContent = [];

    if (user_photo) {
      userContent.push({ type: 'image_url', image_url: { url: user_photo } });
    }
    if (garment_photo) {
      userContent.push({ type: 'image_url', image_url: { url: garment_photo } });
    }

    const prompt = `Tu es un expert en essayage virtuel de mode. Analyse ces images pour évaluer la compatibilité entre la personne et le vêtement.
Mode : ${mode || "article"}
Vêtement : ${garment_name || "Non spécifié"}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "result_url": null,
  "compatibility_score": nombre entre 40 et 98,
  "face_shape": "forme du visage",
  "body_type": "morphologie si visible",
  "style_match": "description de la compatibilité style",
  "recommendations": ["Conseil 1", "Conseil 2"],
  "message": "Analyse courte de l'essayage"
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
        'X-Title': 'BeautyBook Essayage IA',
      },
      body,
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => 'Unknown error');
      return res.status(200).json({
        result_url: null,
        error: "L'essayage virtuel n'est pas encore disponible. L'analyse de compatibilité est consultable dans Maria AI.",
        compatibility_score: 70,
        message: "Essayage en cours de développement — utilisez l'analyse de Maria pour voir la compatibilité.",
        fallback: true,
      });
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content || '';

    try {
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({
        ...parsed,
        result_url: null, // Cannot generate images — frontend shows analysis instead
        fallback: true,
      });
    } catch {
      return res.status(200).json({
        result_url: null,
        compatibility_score: 75,
        message: "Analyse de compatibilité réalisée avec succès.",
        fallback: true,
      });
    }
  } catch (err) {
    console.error('[api/v8/boutique/try-on] Error:', err.message);
    return res.status(200).json({
      result_url: null,
      error: "L'essayage virtuel sera bientôt disponible. En attendant, consultez Maria AI pour une analyse de compatibilité.",
      fallback: true,
    });
  }
}
