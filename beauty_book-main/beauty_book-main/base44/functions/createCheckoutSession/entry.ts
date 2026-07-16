import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { items, type } = body; // type: "panier" ou "reservation"

    if (!items || items.length === 0) {
      return Response.json({ error: "Aucun article à payer" }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    // Créer les line items Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name || item.service_name || "Produit",
          description: item.description || undefined,
          images: item.image_url ? [item.image_url] : undefined,
        },
        unit_amount: Math.round((item.price || item.service_price || 0) * 100), // en centimes
      },
      quantity: item.quantity || 1,
    }));

    const origin = req.headers.get('origin') || 'https://app.base44.com';
    const isReservation = type === "reservation";
    const successUrl = isReservation
      ? `${origin}/rendez-vous?payment=success&crg_code=${body.metadata?.crg_code || ''}`
      : `${origin}/panier?success=true`;
    const cancelUrl = isReservation
      ? `${origin}/reservation?payment=cancelled`
      : `${origin}/panier`;

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        type: type || "panier",
        reservation_id: body.metadata?.reservation_id || "",
        payment_type: body.metadata?.payment_type || "full",
        crg_code: body.metadata?.crg_code || "",
      },
    });

    console.log("[Stripe] Session créée:", session.id);
    return Response.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error("[Stripe Error]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});