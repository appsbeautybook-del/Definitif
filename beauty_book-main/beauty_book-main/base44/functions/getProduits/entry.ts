import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { produitId, category, featured } = body;

    if (produitId) {
      const produit = await base44.asServiceRole.entities.Produit.get(produitId);
      if (!produit) return Response.json({ error: "Produit introuvable" }, { status: 404 });
      return Response.json({ produit });
    }

    const filter = { status: "actif" };
    if (category && category !== "Tout") filter.category = category;
    if (featured) filter.featured = true;

    const produits = await base44.asServiceRole.entities.Produit.filter(filter, '-created_date', 50);
    return Response.json({ produits });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});