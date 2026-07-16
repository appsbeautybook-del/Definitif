import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch data in parallel
    const [styles, services, annonces, reels, produits, immobilier] = await Promise.all([
      base44.asServiceRole.entities.Style.filter({ status: "publie" }, '-likes', 6),
      base44.asServiceRole.entities.Service.filter({ status: "actif", featured: true }, '-created_date', 4),
      base44.asServiceRole.entities.Annonce.filter({ status: "actif", type: "banner" }, '-created_date', 3),
      base44.asServiceRole.entities.Reel.filter({ status: "publie" }, '-views', 4),
      base44.asServiceRole.entities.Produit.filter({ status: "actif", featured: true }, '-created_date', 4),
      base44.asServiceRole.entities.ImmobilierListing.filter({ status: "actif", disponible: true }, '-created_date', 2),
    ]);

    return Response.json({ styles, services, annonces, reels, produits, immobilier });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});