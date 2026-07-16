import express from 'express';
import { stripeWebhook, shopifyProducts, muxLive } from '../controllers/webhook.controller.js';

const router = express.Router();

// Note: Stripe webhook needs raw body for signature verification, 
// so express.json() shouldn't be applied to it if using verify
router.post('/stripe', stripeWebhook);
router.post('/shopify', shopifyProducts);
router.post('/mux-live', muxLive);

export default router;
