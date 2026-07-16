import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { type, listingId } = body;

    if (listingId) {
      const listing = await base44.asServiceRole.entities.ImmobilierListing.get(listingId);
      return Response.json({ listing });
    }

    const filter = { status: "actif" };
    if (type) filter.type = type;

    const listings = await base44.asServiceRole.entities.ImmobilierListing.filter(filter, '-created_date', 50);
    return Response.json({ listings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});