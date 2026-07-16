import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { query = "beauty pop", limit = 25 } = await req.json();

    const q = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=${limit}&explicit=No`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!res.ok) {
      return Response.json({ results: [] }, { status: 200 });
    }

    const data = await res.json();

    const mapped = (data.results || []).map(track => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      duration: track.trackTimeMillis
        ? `${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, "0")}`
        : "--:--",
      genre: track.primaryGenreName || "Musique",
      artwork: track.artworkUrl60,
      previewUrl: track.previewUrl || null,
    }));

    return Response.json({ results: mapped });
  } catch (error) {
    console.error("searchMusic error:", error.message);
    return Response.json({ results: [] }, { status: 200 });
  }
});