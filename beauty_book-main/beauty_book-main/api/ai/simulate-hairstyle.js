import { getOpenRouterKey } from '../_lib/config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userPhotoUrl, styleTitle, referenceImages } = req.body;
  const OPENROUTER_KEY = getOpenRouterKey();

  try {
    const userContent = [];

    // Add user photo for analysis
    if (userPhotoUrl) {
      userContent.push({
        type: 'image_url',
        image_url: { url: userPhotoUrl }
      });
    }

    // Add reference style images
    if (referenceImages && referenceImages.length > 0) {
      for (const img of referenceImages.slice(0, 2)) {
        if (img) {
          userContent.push({
            type: 'image_url',
            image_url: { url: img }
          });
        }
      }
    }

    const prompt = `Tu es un expert en coiffure IA. Analyse ces images et retourne un diagnostic JSON.
${userPhotoUrl ? "La première image est la photo de l'utilisateur." : ""}
${referenceImages?.length ? "Les autres images sont le style de coiffure souhaité." : ""}
Style demandé : ${styleTitle || "Non spécifié"}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "faceShape": "forme du visage détectée (oval, rond, carré, long, coeur)",
  "compatibilityScore": nombre entre 40 et 98 (score de compatibilité du style avec le visage),
  "message": "Analyse courte du style par rapport au visage de l'utilisateur",
  "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "generatedImageUrl": null
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
        'X-Title': 'BeautyBook Filtre IA',
      },
      body,
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => 'Unknown error');
      // Return fallback instead of error — FiltreAIModal handles fallback gracefully
      return res.status(200).json({
        faceShape: "Analyse par IA",
        compatibilityScore: 75,
        message: `Le style "${styleTitle}" pourrait bien se marier avec vos traits. Les résultats varient selon la texture et la forme de votre visage.`,
        recommendations: ["Consultez un styliste pour un avis personnalisé", "Testez différentes variantes du style"],
        generatedImageUrl: null,
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
        generatedImageUrl: null, // We can't generate images — frontend handles this
        fallback: true,
      });
    } catch {
      // JSON parse failed — return fallback
      return res.status(200).json({
        faceShape: "Analyse par IA",
        compatibilityScore: 72,
        message: `Le style "${styleTitle}" présente une compatibilité intéressante avec votre morphologie.`,
        recommendations: ["Essayez ce style avec un coiffeur professionnel"],
        generatedImageUrl: null,
        fallback: true,
      });
    }
  } catch (err) {
    console.error('[api/ai/simulate-hairstyle] Error:', err.message);
    return res.status(200).json({
      faceShape: "Analyse par IA",
      compatibilityScore: 70,
      message: `Le style "${styleTitle}" pourrait correspondre à votre morphologie.`,
      recommendations: ["Consultez un expert coiffure pour validation"],
      generatedImageUrl: null,
      fallback: true,
    });
  }
}
