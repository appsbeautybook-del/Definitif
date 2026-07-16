import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { category, limit = 20 } = body;

    const filter = { status: "publie" };
    if (category && category !== "Réels") filter.category = category;

    const reels = await base44.asServiceRole.entities.Reel.filter(filter, '-created_date', limit);
    return Response.json({ reels });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});