import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, item } = body;
    // action: "add" | "remove" | "increment" | "decrement" | "clear"

    let paniers = await base44.entities.Panier.filter({ user_email: user.email }, '-created_date', 1);
    let panier = paniers[0];

    if (!panier) {
      panier = await base44.entities.Panier.create({ user_email: user.email, items: [], total: 0 });
    }

    let items = [...(panier.items || [])];

    if (action === "add") {
      const existing = items.find(i => i.produit_id === item.produit_id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        items.push({ ...item, quantity: 1 });
      }
    } else if (action === "remove") {
      items = items.filter(i => i.produit_id !== item.produit_id);
    } else if (action === "increment") {
      const i = items.find(i => i.produit_id === item.produit_id);
      if (i) i.quantity = (i.quantity || 1) + 1;
    } else if (action === "decrement") {
      const i = items.find(i => i.produit_id === item.produit_id);
      if (i) {
        i.quantity = Math.max(0, (i.quantity || 1) - 1);
        if (i.quantity === 0) items = items.filter(x => x.produit_id !== item.produit_id);
      }
    } else if (action === "clear") {
      items = [];
    }

    const total = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
    panier = await base44.entities.Panier.update(panier.id, { items, total: Math.round(total * 100) / 100 });

    return Response.json({ panier, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});