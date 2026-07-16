import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FAL_BASE = "https://queue.fal.run";

// Poll fal.ai queue until result is ready (max 3min)
async function pollFalQueue(endpoint, requestId, apiKey, maxWaitMs = 180000) {
  const interval = 5000;
  const maxAttempts = Math.floor(maxWaitMs / interval);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));

    const statusRes = await fetch(`${FAL_BASE}/${endpoint}/requests/${requestId}/status`, {
      headers: { "Authorization": `Key ${apiKey}` }
    });

    if (!statusRes.ok) {
      console.error(`Poll ${i+1} error: ${statusRes.status}`);
      continue;
    }

    const status = await statusRes.json();
    console.log(`Poll ${i+1}/${maxAttempts}: status=${status.status}`);

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(`${FAL_BASE}/${endpoint}/requests/${requestId}`, {
        headers: { "Authorization": `Key ${apiKey}` }
      });
      if (!resultRes.ok) throw new Error(`Result fetch failed: ${resultRes.status}`);
      const result = await resultRes.json();
      // fal video endpoints return video.url
      const videoUrl = result.video?.url || result.video_url || result.output?.video_url;
      if (!videoUrl) throw new Error("No video URL in result: " + JSON.stringify(result).slice(0, 200));
      return videoUrl;
    }

    if (status.status === "FAILED" || status.status === "CANCELLED") {
      throw new Error(`Request ${status.status}: ${status.error || "unknown"}`);
    }
  }
  throw new Error("Timeout: la génération vidéo a pris trop de temps");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt, aspectRatio = "9:16", durationSeconds = 5 } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Le champ 'prompt' est requis" }, { status: 400 });
    }

    const apiKey = Deno.env.get("FAL_KEY");
    if (!apiKey) {
      return Response.json({ error: "FAL_KEY non configuré" }, { status: 500 });
    }

    console.log("Generating video via fal.ai:", prompt.slice(0, 100));

    // Utiliser minimax-video/image-to-video ou kling-video/v2/master/text-to-video
    const endpoint = "fal-ai/kling-video/v2/master/text-to-video";

    const submitRes = await fetch(`${FAL_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        duration: durationSeconds <= 5 ? "5" : "10",
        aspect_ratio: aspectRatio === "9:16" ? "9:16" : aspectRatio === "1:1" ? "1:1" : "16:9",
      })
    });

    if (!submitRes.ok) {
      const errBody = await submitRes.text();
      console.error("fal.ai submit error:", submitRes.status, errBody);
      return Response.json({ error: `fal.ai erreur ${submitRes.status}: ${errBody.slice(0, 300)}` }, { status: 500 });
    }

    const submission = await submitRes.json();
    console.log("Submitted, request_id:", submission.request_id);

    // Résultat immédiat ?
    if (submission.video?.url) {
      return Response.json({ videoUrl: submission.video.url });
    }

    if (!submission.request_id) {
      throw new Error("Pas de request_id retourné par fal.ai");
    }

    const videoUrl = await pollFalQueue(endpoint, submission.request_id, apiKey);
    console.log("Video ready:", videoUrl);
    return Response.json({ videoUrl });

  } catch (error) {
    console.error("generateVeoVideo error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});