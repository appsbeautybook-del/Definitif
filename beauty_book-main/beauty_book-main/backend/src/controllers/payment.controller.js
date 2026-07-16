import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, type } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article à payer' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || item.service_name || 'Produit',
          description: item.description || undefined,
          images: item.image_url ? [item.image_url] : undefined,
        },
        unit_amount: Math.round((item.price || item.service_price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const isReservation = type === 'reservation';
    const successUrl = isReservation
      ? `${origin}/rendez-vous?payment=success&crg_code=${req.body.metadata?.crg_code || ''}`
      : `${origin}/panier?success=true`;
    const cancelUrl = isReservation
      ? `${origin}/reservation?payment=cancelled`
      : `${origin}/panier`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: type || 'panier',
        reservation_id: req.body.metadata?.reservation_id || '',
        payment_type: req.body.metadata?.payment_type || 'full',
        crg_code: req.body.metadata?.crg_code || '',
      },
    });

    return res.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('[Stripe Error]', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/payments/webhook
export const stripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('[Webhook] Signature invalide:', err.message);
    return res.status(400).send('Webhook Error');
  }

  console.log('[Webhook] Event reçu:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const reservationId = metadata.reservation_id;
    const paymentType = metadata.payment_type || 'full';

    if (reservationId) {
      try {
        const newPaymentStatus = paymentType === 'acompte' ? 'acompte_paye' : 'paye';

        await supabaseAdmin.from('Reservation').update({
          status: 'confirme',
          payment_status: newPaymentStatus,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
        }).eq('id', reservationId);

        console.log(`[Webhook] ✅ Réservation ${reservationId} mise à jour`);

        // Fetch reservation for notifications
        const { data: resa } = await supabaseAdmin
          .from('Reservation').select('*').eq('id', reservationId).single();

        if (resa) {
          await supabaseAdmin.from('Notification').insert([
            {
              user_email: resa.client_email, type: 'reservation',
              title: '💳 Paiement confirmé !',
              body: `Votre paiement pour "${resa.service_name}" a bien été reçu. RDV le ${resa.date} à ${resa.time_slot}. 🎉`,
              link: '/rendez-vous', read: false,
            },
            {
              user_email: resa.pro_email, type: 'reservation',
              title: '💰 Paiement reçu',
              body: `${resa.client_name} a payé pour "${resa.service_name}" le ${resa.date} à ${resa.time_slot}.`,
              link: '/pro/gestion-agenda', read: false,
            }
          ]);
        }
      } catch (err) {
        console.error('[Webhook] Erreur mise à jour réservation:', err.message);
      }
    }
  }

  return res.json({ received: true });
};

// POST /api/payments/subscription-checkout
export const createSubscriptionCheckout = async (req, res) => {
  try {
    const { plan, email } = req.body;
    if (!plan || !email) return res.status(400).json({ error: 'Plan et email requis' });

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price: plan, // Stripe price ID
        quantity: 1,
      }],
      success_url: `${origin}/pro/abonnements?success=true`,
      cancel_url: `${origin}/pro/abonnements?cancelled=true`,
    });

    return res.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
