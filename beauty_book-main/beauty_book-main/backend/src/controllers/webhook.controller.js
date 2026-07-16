import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase.js';

// Webhooks
export const stripeWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const signature = req.headers["stripe-signature"];

  let event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error("[Webhook] Signature invalide:", err.message);
    return res.status(400).send("Webhook Error");
  }

  console.log("[Webhook] Event reçu:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const reservationId = metadata.reservation_id;
    const paymentType = metadata.payment_type || "full";

    if (reservationId) {
      try {
        const newPaymentStatus = paymentType === "acompte" ? "acompte_paye" : "paye";

        await supabaseAdmin.from('Reservation').update({
          status: "confirme",
          payment_status: newPaymentStatus,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
        }).eq('id', reservationId);

        // Fetch reservation for notifications
        const { data: resa } = await supabaseAdmin.from('Reservation').select('*').eq('id', reservationId).single();

        if (resa) {
          // Client notification
          await supabaseAdmin.from('Notification').insert({
            user_email: resa.client_email,
            type: "reservation",
            title: "💳 Paiement confirmé !",
            body: `Votre paiement pour "${resa.service_name}" a bien été reçu.`,
            link: "/rendez-vous",
            read: false,
          });

          // Pro notification
          await supabaseAdmin.from('Notification').insert({
            user_email: resa.pro_email,
            type: "reservation",
            title: "💰 Paiement reçu",
            body: `${resa.client_name} a payé pour "${resa.service_name}".`,
            link: "/pro/gestion-agenda",
            read: false,
          });
        }
      } catch (err) {
        console.error("[Webhook] Erreur:", err.message);
      }
    }
  }

  return res.json({ received: true });
};

export const shopifyProducts = async (req, res) => {
  try {
    const { productId } = req.body;
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
    const rawDomain = process.env.SHOPIFY_DOMAIN || "";
    const domain = rawDomain.includes(".") ? rawDomain : `${rawDomain}.myshopify.com`;

    if (!token || !domain) {
      return res.status(500).json({ error: "SHOPIFY config missing" });
    }

    // Implementation stubbed for brevity, similar to base44 logic
    return res.json({ products: [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const muxLive = async (req, res) => {
  try {
    const { action, session_id, stream_id } = req.body;
    
    if (action === 'status') {
      return res.json({ status: 'idle', active: false });
    }

    return res.json({ success: true, message: "Mux mocked" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
