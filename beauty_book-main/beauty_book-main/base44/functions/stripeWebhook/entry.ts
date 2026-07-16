import Stripe from 'npm:stripe@15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("[Webhook] Signature invalide:", err.message);
    return new Response("Webhook Error", { status: 400 });
  }

  console.log("[Webhook] Event reçu:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const reservationId = metadata.reservation_id;
    const paymentType = metadata.payment_type || "full";

    console.log("[Webhook] Session complétée:", session.id, "| Réservation:", reservationId);

    if (reservationId) {
      try {
        const base44 = createClientFromRequest(req);

        const newPaymentStatus = paymentType === "acompte" ? "acompte_paye" : "paye";

        await base44.asServiceRole.entities.Reservation.update(reservationId, {
          status: "confirme",
          payment_status: newPaymentStatus,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
        });

        console.log(`[Webhook] ✅ Réservation ${reservationId} mise à jour: status=confirme, payment_status=${newPaymentStatus}`);

        // Récupérer la réservation pour envoyer les notifications
        const reservations = await base44.asServiceRole.entities.Reservation.filter(
          { id: reservationId }, "-created_date", 1
        );
        const resa = reservations[0];

        if (resa) {
          // Notification client
          await base44.asServiceRole.entities.Notification.create({
            user_email: resa.client_email,
            type: "reservation",
            title: "💳 Paiement confirmé !",
            body: `Votre paiement pour "${resa.service_name}" a bien été reçu. RDV le ${resa.date} à ${resa.time_slot}. 🎉`,
            link: "/rendez-vous",
            read: false,
          });

          // Notification pro
          await base44.asServiceRole.entities.Notification.create({
            user_email: resa.pro_email,
            type: "reservation",
            title: "💰 Paiement reçu",
            body: `${resa.client_name} a payé pour "${resa.service_name}" le ${resa.date} à ${resa.time_slot}.`,
            link: "/pro/gestion-agenda",
            read: false,
          });
        }
      } catch (err) {
        console.error("[Webhook] Erreur mise à jour réservation:", err.message);
      }
    }
  }

  return Response.json({ received: true });
});