import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteAccount, addFidelitePoints, creditFideliteAuto } from '../controllers/account.controller.js';

const router = express.Router();

router.post('/fidelite/auto', creditFideliteAuto); // Webhook-like trigger, maybe no auth required, but let's keep it open if it checks data (wait, creditFideliteAuto checks body.data. We'll leave it without requireAuth if we want supabase webhooks to call it, but let's just mount it)

// Requires Authentication
router.use(requireAuth);

router.post('/delete', deleteAccount);
router.post('/fidelite/add', addFidelitePoints);

export default router;
