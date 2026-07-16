import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { reelId, liked } = body;

    if (!reelId) return Response.json({ error: 'reelId requis' }, { status: 400 });

    const reel = await base44.asServiceRole.entities.Reel.get(reelId);
    if (!reel) return Response.json({ error: 'Reel introuvable' }, { status: 404 });

    const newLikes = liked ? (reel.likes || 0) + 1 : Math.max(0, (reel.likes || 0) - 1);
    await base44.asServiceRole.entities.Reel.update(reelId, { likes: newLikes });

    return Response.json({ likes: newLikes, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});