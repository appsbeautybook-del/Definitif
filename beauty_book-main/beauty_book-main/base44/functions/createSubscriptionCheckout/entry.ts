import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return Response.json({ error: "priceId requis" }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || "https://app.base44.com/success",
      cancel_url: cancelUrl || "https://app.base44.com/cancel",
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe subscription error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});