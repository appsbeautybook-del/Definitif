import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { items, shipping_address, payment_method, notes } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: 'Panier vide' }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    const commande = await base44.entities.Commande.create({
      client_email: user.email,
      client_name: user.full_name,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping,
      total: Math.round(total * 100) / 100,
      status: "en_attente",
      shipping_address,
      payment_method,
      notes,
    });

    // Clear panier
    const paniers = await base44.entities.Panier.filter({ user_email: user.email });
    for (const p of paniers) {
      await base44.entities.Panier.update(p.id, { items: [], total: 0 });
    }

    // Notification
    await base44.entities.Notification.create({
      user_email: user.email,
      type: "commande",
      title: "Commande confirmée 🛍️",
      body: `Votre commande de ${total.toFixed(2)}€ a bien été reçue.`,
      link: "/mes-commandes",
      read: false,
    });

    return Response.json({ commande, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});