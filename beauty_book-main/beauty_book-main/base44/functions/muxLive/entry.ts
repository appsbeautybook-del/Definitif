import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MUX_BASE = "https://api.mux.com";

function getAuthHeader() {
  const id = Deno.env.get("MUX_TOKEN_ID") || "";
  const secret = Deno.env.get("MUX_TOKEN_SECRET") || "";
  // Use TextEncoder for safe base64 encoding with special characters
  const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(`${id}:${secret}`)));
  return "Basic " + encoded;
}

async function muxRequest(method, path, body) {
  const res = await fetch(MUX_BASE + path, {
    method,
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Mux error", res.status, JSON.stringify(data));
    throw new Error(data.error?.messages?.[0] || data.message || `Mux HTTP ${res.status}`);
  }
  return data;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { action, session_id, stream_id } = body;

    // ── Créer un live stream Mux ──────────────────────────────────────────────
    if (action === "create") {
      const data = await muxRequest("POST", "/video/v1/live-streams", {
        playback_policy: ["public"],
        new_asset_settings: { playback_policy: ["public"] },
        reduced_latency: true,
      });

      const stream = data.data;
      const playback_id = stream.playback_ids?.[0]?.id;
      const stream_key = stream.stream_key;
      const rtmp_url = `rtmps://global-live.mux.com:443/app`;
      const hls_url = `https://stream.mux.com/${playback_id}.m3u8`;
      const thumbnail_url = `https://image.mux.com/${playback_id}/thumbnail.jpg`;

      // Mettre à jour la session avec les infos Mux
      if (session_id) {
        await base44.asServiceRole.entities.LiveSession.update(session_id, {
          mux_stream_id: stream.id,
          mux_playback_id: playback_id,
          hls_url,
          thumbnail_url,
          status: "live",
        });
      }

      return Response.json({
        stream_id: stream.id,
        stream_key,
        rtmp_url,
        hls_url,
        thumbnail_url,
        playback_id,
      });
    }

    // ── Supprimer/terminer un live stream Mux ────────────────────────────────
    if (action === "delete" && stream_id) {
      await muxRequest("DELETE", `/video/v1/live-streams/${stream_id}`).catch(() => {});
      return Response.json({ success: true });
    }

    // ── Statut d'un live stream ──────────────────────────────────────────────
    if (action === "status" && stream_id) {
      const data = await muxRequest("GET", `/video/v1/live-streams/${stream_id}`);
      return Response.json({ status: data.data?.status, active: data.data?.status === "active" });
    }

    // ── Créer un stream Mux avec support WHIP ───────────────────────────────
    if (action === "create_whip") {
      const data = await muxRequest("POST", "/video/v1/live-streams", {
        playback_policy: ["public"],
        new_asset_settings: { playback_policy: ["public"] },
        reduced_latency: true,
        latency_mode: "low",
      });

      const stream = data.data;
      const playback_id = stream.playback_ids?.[0]?.id;
      const stream_key = stream.stream_key;
      const hls_url = `https://stream.mux.com/${playback_id}.m3u8`;
      const thumbnail_url = `https://image.mux.com/${playback_id}/thumbnail.jpg`;
      // WHIP endpoint for browser-based streaming
      const whip_url = `https://global-live.mux.com/app/${stream_key}/whip`;

      if (session_id) {
        await base44.asServiceRole.entities.LiveSession.update(session_id, {
          mux_stream_id: stream.id,
          mux_playback_id: playback_id,
          hls_url,
          thumbnail_url,
          status: "live",
        });
      }

      return Response.json({
        stream_id: stream.id,
        stream_key,
        whip_url,
        hls_url,
        thumbnail_url,
        playback_id,
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });

  } catch (error) {
    console.error("muxLive error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});