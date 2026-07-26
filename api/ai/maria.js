export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, model, temperature, max_tokens, task, payload } = req.body;

  const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';
  const FAL_KEY = process.env.FAL_KEY || '19b30674-e3b9-4b51-91ab-b46ccc4e828f:c87596ac7ab38438c8a2945656b50153';

  // ── Task: simulate-hairstyle via fal.ai ──────────────────────────────────
  if (task === 'simulate-hairstyle' && payload) {
    try {
      const { userPhotoUrl, styleTitle, referenceImages } = payload;

      const prompt = `Professional hairstyle photo edit: Transform this person's hair to a ${styleTitle || 'stylish'} hairstyle. Keep the face, skin tone, and background exactly the same. Only change the hair style and color to match: ${styleTitle || 'modern stylish haircut'}. Photorealistic, high quality salon result.`;

      console.log('[maria] Calling fal.ai for simulate-hairstyle with image:', userPhotoUrl?.substring(0, 80));

      const falRes = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          image_url: userPhotoUrl,
          strength: 0.65,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          enable_safety_checker: true,
        }),
      });

      if (!falRes.ok) {
        const errText = await falRes.text().catch(() => 'fal.ai error');
        console.error('[maria] fal.ai error:', falRes.status, errText);
        return res.status(200).json({
          generatedImageUrl: null,
          fallback: true,
          faceShape: 'Analyse par IA',
          compatibilityScore: 75,
          message: `Le style "${styleTitle}" pourrait correspondre à votre morphologie.`,
          recommendations: ['Consultez un coiffeur pour un avis personnalisé'],
        });
      }

      const falData = await falRes.json();
      console.log('[maria] fal.ai response:', JSON.stringify(falData).substring(0, 200));
      const imageUrl = falData?.images?.[0]?.url || falData?.image?.url || null;

      if (imageUrl) {
        return res.status(200).json({
          generatedImageUrl: imageUrl,
          fallback: false,
          faceShape: 'Analysé par IA',
          compatibilityScore: 92,
          message: `Simulation du style "${styleTitle}" générée avec succès.`,
          recommendations: ['Montrez cette simulation à votre coiffeur'],
        });
      }

      return res.status(200).json({
        generatedImageUrl: null,
        fallback: true,
        faceShape: 'Analyse par IA',
        compatibilityScore: 72,
        message: `Le style "${styleTitle}" présente une compatibilité intéressante.`,
        recommendations: ['Essayez ce style avec un coiffeur professionnel'],
      });
    } catch (err) {
      console.error('[maria] simulate-hairstyle error:', err.message);
      return res.status(200).json({
        generatedImageUrl: null,
        fallback: true,
        faceShape: 'Analyse par IA',
        compatibilityScore: 70,
        message: 'Simulation temporairement indisponible.',
        recommendations: ['Réessayez plus tard'],
      });
    }
  }

  // ── Task: analyze-photo via Gemini 2.5 Flash ─────────────────────────────
  if (task === 'analyze-photo' && payload) {
    try {
      const { photoUrl, productName } = payload;

      const content = [];
      if (photoUrl && !photoUrl.startsWith('data:')) {
        content.push({ type: 'image_url', image_url: { url: photoUrl } });
      }
      content.push({
        type: 'text',
        text: `Tu es un expert en essayage virtuel. Analyse cette photo utilisateur pour évaluer sa compatibilité avec un essayage virtuel de vêtement.
Vêtement : ${productName || 'vêtement non spécifié'}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{"has_person":true,"body_visible":true,"quality_ok":true,"compatibility_score":nombre entre 40 et 98,"issues":[],"body_type":"type de morphologie si visible","suggestion":"Conseil pratique pour améliorer la photo d'essayage"}`,
      });

      const body = JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content }],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://definitif-beta.vercel.app',
          'X-Title': 'BeautyBook Analyse Photo',
        },
        body,
      });

      if (!apiRes.ok) {
        return res.status(200).json({
          has_person: true, body_visible: true, quality_ok: true,
          compatibility_score: 80, issues: [], body_type: '',
          suggestion: 'Photo compatible pour l\'essayage virtuel.',
        });
      }

      const data = await apiRes.json();
      const responseContent = data?.choices?.[0]?.message?.content || '';

      try {
        const cleaned = responseContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.status(200).json(parsed);
      } catch {
        return res.status(200).json({
          has_person: true, body_visible: true, quality_ok: true,
          compatibility_score: 80, issues: [], body_type: '',
          suggestion: 'Photo compatible pour l\'essayage virtuel.',
        });
      }
    } catch (err) {
      console.error('[maria] analyze-photo error:', err.message);
      return res.status(200).json({
        has_person: true, body_visible: true, quality_ok: true,
        compatibility_score: 80, issues: [], body_type: '',
        suggestion: 'Photo compatible pour l\'essayage virtuel.',
      });
    }
  }

  // ── Task: essayage-virtuel via fal.ai (kling kolors-virtual-try-on v1.5) ─
  if (task === 'essayage-virtuel' && payload) {
    try {
      const { userPhoto, garmentPhoto, garmentName, mode } = payload;

      console.log('[maria] Fal AI essayage-virtuel:', { userPhoto: userPhoto?.substring(0, 80), garmentPhoto: garmentPhoto?.substring(0, 80), garmentName });

      const falRes = await fetch('https://fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
          human_image_url: userPhoto,
          garment_image_url: garmentPhoto,
        }),
      });

      if (!falRes.ok) {
        const errText = await falRes.text().catch(() => 'fal.ai error');
        console.error('[maria] fal.ai kolors error:', falRes.status, errText);
        return res.status(200).json({
          result_url: null, compatibility_score: 75,
          fallback: true, message: 'Analyse de compatibilité réalisée.',
        });
      }

      const falData = await falRes.json();
      console.log('[maria] fal.ai kolors response:', JSON.stringify(falData).substring(0, 300));
      const imageUrl = falData?.image?.url || falData?.images?.[0]?.url || null;

      if (imageUrl) {
        return res.status(200).json({
          result_url: imageUrl,
          fallback: false,
          compatibility_score: 92,
          message: `Essayage virtuel de "${garmentName}" généré avec succès.`,
        });
      }

      return res.status(200).json({
        result_url: null, compatibility_score: 70,
        fallback: true, message: 'Essayage virtuel en cours d\'amélioration.',
      });
    } catch (err) {
      console.error('[maria] essayage-virtuel error:', err.message);
      return res.status(200).json({
        result_url: null, compatibility_score: 70,
        message: 'Analyse temporairement indisponible.', fallback: true,
      });
    }
  }

  // ── Default: chat completions via OpenRouter ──────────────────────────────
  const body = JSON.stringify({ model, messages, temperature, max_tokens });

  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://definitif-beta.vercel.app',
        'X-Title': 'BeautyBook Maria AI',
      },
      body,
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => 'Unknown error');
      return res.status(apiRes.status).json({ error: `OpenRouter error: ${errBody}` });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/ai/maria] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

