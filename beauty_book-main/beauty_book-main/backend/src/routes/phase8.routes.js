import express from 'express';
import { addFidelitePoints, creditFideliteAuto } from '../controllers/fidelite.controller.js';
import { shAiTryOn, createShopifyCheckout, trackOrder } from '../controllers/boutique.controller.js';
import { createSubscriptionCheckout } from '../controllers/subscription.controller.js';
import { sendReservationReminders } from '../controllers/reminder.controller.js';
import { manageAnnonce, manageStyle, manageReel, listPublishedStyles, fixStyleStatuses, manageEntity } from '../controllers/manage.controller.js';
import { deleteAccount } from '../controllers/deleteAccount.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public: styles publiés (pas d'auth requis)
router.get('/styles/published', listPublishedStyles);
router.post('/styles/fix-statuses', fixStyleStatuses);

// Fidélité
router.post('/fidelite/add', requireAuth, addFidelitePoints);
router.post('/fidelite/auto-credit', creditFideliteAuto); // Appelé par webhook/automation

// Boutique & E-commerce
router.post('/boutique/try-on', requireAuth, shAiTryOn);
router.post('/boutique/shopify-checkout', requireAuth, createShopifyCheckout);
router.post('/boutique/track-order', requireAuth, trackOrder);

// Abonnements
router.post('/subscription/checkout', requireAuth, createSubscriptionCheckout);

// Rappels automatiques (protégé par x-admin-token)
router.post('/reminders/send', sendReservationReminders);

// Gestion du contenu (annonces & styles)
router.post('/manage/annonce', requireAuth, manageAnnonce);
router.post('/manage/style', requireAuth, manageStyle);
router.post('/manage/reel', manageReel);

// Generic entity CRUD (admin only, bypasses RLS via supabaseAdmin)
router.post('/manage/entity', requireAuth, manageEntity);

// Suppression de compte
router.delete('/account', requireAuth, deleteAccount);

export default router;
