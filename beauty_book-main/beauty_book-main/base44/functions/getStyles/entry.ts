import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { category, limit = 20 } = body;

    const filter = { status: "publie" };
    if (category && category !== "Tout") filter.category = category;

    const styles = await base44.asServiceRole.entities.Style.filter(filter, '-likes', limit);
    return Response.json({ styles });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});