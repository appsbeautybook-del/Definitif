import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { type = "feed" } = body;

    const annonces = await base44.asServiceRole.entities.Annonce.filter({ status: "actif", type }, '-created_date', 5);

    // Track impressions
    for (const a of annonces) {
      await base44.asServiceRole.entities.Annonce.update(a.id, { impressions: (a.impressions || 0) + 1 });
    }

    return Response.json({ annonces });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});