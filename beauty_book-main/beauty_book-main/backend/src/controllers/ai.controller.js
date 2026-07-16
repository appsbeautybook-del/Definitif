import { supabaseAdmin } from '../config/supabase.js';
import { submitFalModel } from '../services/fal.js';

const LLM_API_URL = 'https://opencode.ai/zen/v1/chat/completions';
const LLM_API_KEY = 'sk-ziv83S32mc2ZSb6g5h4faZnuIhXAZGlRYZSAOkMOX4KeqvL5FOHpmGnMeA5Jnsfw';
const LLM_MODEL = 'mimo-v2.5-free';

export const invokeLLM = async (req, res) => {
  try {
    const { prompt, response_json_schema, file_urls, model } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const content = [];

    // Add image URLs as vision input if provided
    if (file_urls && file_urls.length > 0) {
      for (const url of file_urls) {
        content.push({
          type: 'image_url',
          image_url: { url }
        });
      }
    }

    // Add text prompt
    content.push({ type: 'text', text: prompt });

    const messages = [{ role: 'user', content }];
    const body = {
      model: model || LLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    };
    if (response_json_schema) body.response_format = { type: 'json_object' };

    const llmRes = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text().catch(() => '');
      throw new Error(`LLM API error ${llmRes.status}: ${errText}`);
    }

    const data = await llmRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (response_json_schema) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return res.json(JSON.parse(jsonMatch[0]));
      } catch {}
    }

    return res.json({ content: text, fallback: false });
  } catch (error) {
    console.error('invokeLLM error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const shAiImageSearch = async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    // Since we don't have base44 InvokeLLM here, we could use Groq or OpenAI
    // For now, let's just return a placeholder or do a naive search
    const { data: products } = await supabaseAdmin.from('Produit').select('*').eq('status', 'actif').limit(8);

    const scored = (products || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand || "",
      price: p.price,
      img: p.image_url,
    }));

    return res.json({
      products: scored,
      detected_items: [{ type: "Vêtement", color: "inconnue", style: "tendance" }],
    });
  } catch (error) {
    console.error("shAiImageSearch error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const simulateHairstyle = async (req, res) => {
  try {
    const { userPhotoUrl, styleTitle, referenceImages } = req.body;

    if (!userPhotoUrl || !styleTitle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Simulating hairstyle:", styleTitle);

    // Try fal.ai hair-change model
    try {
      const result = await submitFalModel("fal-ai/image-editing/hair-change", {
        image_url: userPhotoUrl,
        prompt: styleTitle,
        guidance_scale: 7.5,
        num_inference_steps: 30,
      });

      const generatedImageUrl = result.image?.url || result.images?.[0]?.url || result.output?.[0] || result.image_url;
      if (generatedImageUrl) {
        return res.json({
          generatedImageUrl,
          fallback: false,
          source: 'fal-ai-hair-change',
        });
      }
    } catch (e) {
      console.warn('fal.ai hair-change failed:', e.message);
    }

    // Fallback: try flux-pro
    try {
      const result = await submitFalModel("fal-ai/flux-pro/v1.1", {
        prompt: `Un portrait professionnel avec une coiffure ${styleTitle}, réaliste, haute qualité`,
        image_url: userPhotoUrl,
        strength: 0.85,
      });

      const generatedImageUrl = result.image?.url || result.images?.[0]?.url || result.output?.[0] || result.image_url;
      if (generatedImageUrl) {
        return res.json({
          generatedImageUrl,
          fallback: false,
          source: 'fal-ai-flux-pro',
        });
      }
    } catch (e) {
      console.warn('fal.ai flux-pro failed:', e.message);
    }

    // Final fallback: return reference image
    return res.json({
      generatedImageUrl: referenceImages?.[0] || userPhotoUrl,
      fallback: true,
      source: 'reference',
      message: "Génération IA indisponible pour le moment"
    });
  } catch (error) {
    console.error("simulateHairstyle error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const generateVeoVideo = async (req, res) => {
  try {
    const { prompt, aspectRatio, durationSeconds } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Le champ 'prompt' est requis" });
    }

    // fal.ai video generation
    try {
      const result = await submitFalModel("fal-ai/kling-video/v2/master/text-to-video", {
        prompt,
        aspect_ratio: aspectRatio || "16:9",
        duration: durationSeconds || 5,
      });

      const videoUrl = result.video?.url || result.video_url;
      if (videoUrl) {
        return res.json({ videoUrl, fallback: false });
      }
    } catch (e) {
      console.warn('fal.ai video generation failed:', e.message);
    }

    return res.json({ videoUrl: null, error: "Génération vidéo indisponible", fallback: true });
  } catch (error) {
    console.error("generateVeoVideo error:", error);
    return res.status(500).json({ error: error.message });
  }
};
