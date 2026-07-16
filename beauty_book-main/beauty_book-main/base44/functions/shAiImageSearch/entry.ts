import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Styliste IA - Visual search: finds similar products from the boutique based on an image
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { image_url } = body;

    if (!image_url) {
      return Response.json({ error: "image_url is required" }, { status: 400 });
    }

    // Use InvokeLLM with vision to identify clothing items in the image
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en mode. Analyse cette image et identifie tous les vêtements et accessoires visibles. Pour chaque article, décris : le type (robe, pantalon, veste, chaussures, sac, etc.), la couleur principale, le style (casual, chic, sport, etc.) et des mots-clés de recherche en français. Retourne un JSON.`,
      image_url: image_url,
      response_json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                color: { type: "string" },
                style: { type: "string" },
                search_keywords: { type: "string" }
              }
            }
          }
        }
      }
    });

    const detectedItems = analysis?.items || [];
    console.log("Detected items:", JSON.stringify(detectedItems));

    if (detectedItems.length === 0) {
      return Response.json({ products: [], detected_items: [] });
    }

    // Search in Produit entity
    const allProducts = await base44.asServiceRole.entities.Produit.filter({ status: "actif" }, "-created_date", 200);

    // Score products by keyword match
    const scored = allProducts
      .filter(p => p.image_url)
      .map(p => {
        const text = `${p.name} ${p.brand || ""} ${p.description || ""}`.toLowerCase();
        const score = detectedItems.reduce((acc, item) => {
          const kw = `${item.type} ${item.color} ${item.style} ${item.search_keywords}`.toLowerCase();
          const words = kw.split(/\s+/).filter(w => w.length > 2);
          return acc + words.filter(w => text.includes(w)).length;
        }, 0);
        return { ...p, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 8)
      .map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || "",
        price: p.price,
        img: p.image_url,
      }));

    return Response.json({
      products: scored,
      detected_items: detectedItems,
    });

  } catch (error) {
    console.error("shAiImageSearch error:", error.message);
    return Response.json({ products: [], error: error.message });
  }
});