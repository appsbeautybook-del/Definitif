import express from 'express';
import { createCheckoutSession, stripeWebhook, createSubscriptionCheckout, createWalletRecharge } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Stripe webhook — MUST be before express.json() middleware
// The webhook needs the raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Authenticated routes
router.post('/checkout-session', requireAuth, createCheckoutSession);
router.post('/subscription-checkout', requireAuth, createSubscriptionCheckout);
router.post('/wallet-recharge', requireAuth, createWalletRecharge);

export default router;
