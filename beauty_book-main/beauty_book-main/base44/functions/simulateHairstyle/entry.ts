import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// fal.ai Queue API :
// POST  https://queue.fal.run/{model}           -> { request_id, status_url, response_url, ... }
// GET   {status_url}                            -> { status: "IN_QUEUE"|"IN_PROGRESS"|"COMPLETED", ... }
// GET   {response_url}                          -> résultat final

async function pollFalQueue(statusUrl, responseUrl, apiKey, maxWaitMs = 90000) {
  const interval = 3000;
  const maxAttempts = Math.floor(maxWaitMs / interval);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));

    const statusRes = await fetch(statusUrl, {
      headers: { "Authorization": `Key ${apiKey}` }
    });

    if (!statusRes.ok) {
      const t = await statusRes.text();
      console.error(`Poll ${i + 1} error ${statusRes.status}: ${t.slice(0, 120)}`);
      continue;
    }

    const status = await statusRes.json();
    console.log(`Poll ${i + 1}/${maxAttempts}: ${status.status}`);

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(responseUrl, {
        headers: { "Authorization": `Key ${apiKey}` }
      });
      if (!resultRes.ok) throw new Error(`Result fetch failed: ${resultRes.status}`);
      const result = await resultRes.json();
      const images = result.images || result.output?.images || [];
      if (images.length > 0) return images[0].url || images[0];
      if (result.image?.url) return result.image.url;
      if (result.output?.image?.url) return result.output.image.url;
      throw new Error("No image in result: " + JSON.stringify(result).slice(0, 200));
    }

    if (status.status === "FAILED" || status.status === "CANCELLED") {
      throw new Error(`fal.ai ${status.status}: ${status.error || "unknown error"}`);
    }
  }
  throw new Error("Timeout: fal.ai generation took too long");
}

// Soumettre une requête fal.ai et attendre le résultat
async function runFalModel(model, body, apiKey) {
  const submitRes = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`${model} submit ${submitRes.status}: ${err.slice(0, 200)}`);
  }

  const submission = await submitRes.json();
  console.log(`${model} queued, request_id: ${submission.request_id}`);

  // Résultat direct (synchrone)
  if (submission.images?.length > 0) return submission.images[0].url || submission.images[0];
  if (submission.image?.url) return submission.image.url;

  // Asynchrone : utiliser les URLs de la réponse
  const statusUrl = submission.status_url;
  const responseUrl = submission.response_url;
  if (!statusUrl || !responseUrl) throw new Error(`No status/response URLs from ${model}`);

  return await pollFalQueue(statusUrl, responseUrl, apiKey);
}

// Modèle 1 : hair-change (modèle spécialisé coiffure)
async function tryHairChange(userPhotoUrl, hairPrompt, apiKey) {
  console.log("Trying fal-ai/image-editing/hair-change");
  return await runFalModel("fal-ai/image-editing/hair-change", {
    image_url: userPhotoUrl,
    prompt: hairPrompt,
    guidance_scale: 3.5,
    num_inference_steps: 28,
    output_format: "jpeg",
    safety_tolerance: "5",
  }, apiKey);
}

// Modèle 2 : flux-pro image-to-image avec prompt descriptif
async function tryFluxEdit(userPhotoUrl, hairPrompt, apiKey) {
  console.log("Trying fal-ai/flux-pro/v1.1");
  const prompt = `Portrait of a person with ${hairPrompt}. Keep face and skin tone identical to original. Photorealistic, professional salon photo, natural lighting.`;
  return await runFalModel("fal-ai/flux-pro/v1.1", {
    prompt,
    image_url: userPhotoUrl,
    strength: 0.55,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: "jpeg",
    safety_tolerance: "5",
  }, apiKey);
}

// Fallback final : GenerateImage Base44 avec l'image du style comme référence
async function generateImageFallback(base44, styleTitle, referenceImages) {
  console.log("Using GenerateImage fallback for:", styleTitle);
  const hairPrompt = buildHairPrompt(styleTitle);
  const prompt = `Portrait of a model with a beautiful ${styleTitle} hairstyle. ${hairPrompt}. Professional salon photo, natural lighting, high quality, photorealistic, face visible.`;

  const { url } = await base44.integrations.Core.GenerateImage({
    prompt,
    ...(referenceImages?.[0] ? { existing_image_urls: [referenceImages[0]] } : {}),
  });

  console.log("GenerateImage fallback succeeded:", url);
  return Response.json({
    generatedImageUrl: url,
    fallback: true,
    message: "Simulation générée par IA à partir du style de référence"
  });
}

function buildHairPrompt(styleTitle) {
  const styleMap = {
    "balayage": "balayage highlights with warm golden sun-kissed tones, natural blended highlights",
    "bob": "chic bob haircut, chin-length, sleek and polished",
    "boucles": "natural loose curls, voluminous bouncy ringlets, defined curl pattern",
    "lisse": "ultra sleek straight hair, glass-like shine, perfectly smooth",
    "tresses": "long box braids, neat sections, protective style braids",
    "pixie": "short pixie cut, textured layers on top, close-cropped sides",
    "waves": "effortless beach waves, tousled wavy texture, sun-kissed look",
    "afro": "big natural afro, voluminous and round shape, defined curl pattern",
    "lob": "long bob lob haircut, shoulder-length, polished and straight",
    "chignon": "elegant updo chignon bun, sleek pulled back hairstyle",
    "dreadlocks": "neat dreadlocks, textured locs hairstyle",
    "fade": "high fade haircut, clean sharp lines, short sides",
    "coloration": "vibrant hair color transformation, beautiful hair dye",
  };

  const key = styleTitle.toLowerCase();
  for (const [pattern, desc] of Object.entries(styleMap)) {
    if (key.includes(pattern)) return desc;
  }
  return `${styleTitle} hairstyle, photorealistic, natural-looking professional hair`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { userPhotoUrl, styleTitle, referenceImages } = await req.json();

    if (!userPhotoUrl || !styleTitle) {
      return Response.json({ error: "Missing required fields: userPhotoUrl, styleTitle" }, { status: 400 });
    }

    const apiKey = Deno.env.get("FAL_KEY");
    const hairPrompt = buildHairPrompt(styleTitle);

    console.log("=== simulateHairstyle ===");
    console.log("Style:", styleTitle, "| Prompt:", hairPrompt);
    console.log("Reference images:", referenceImages?.length || 0);

    if (!apiKey) {
      console.log("No FAL_KEY, using fallback directly");
      return await generateImageFallback(base44, styleTitle, referenceImages);
    }

    // 1. Essayer hair-change (modèle spécialisé)
    try {
      const imageUrl = await tryHairChange(userPhotoUrl, hairPrompt, apiKey);
      return Response.json({ generatedImageUrl: imageUrl });
    } catch (e) {
      console.error("hair-change failed:", e.message);
    }

    // 2. Essayer flux-pro image-to-image
    try {
      const imageUrl = await tryFluxEdit(userPhotoUrl, hairPrompt, apiKey);
      return Response.json({ generatedImageUrl: imageUrl });
    } catch (e) {
      console.error("flux-pro failed:", e.message);
    }

    // 3. Fallback GenerateImage Base44
    return await generateImageFallback(base44, styleTitle, referenceImages);

  } catch (error) {
    console.error("simulateHairstyle global error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});