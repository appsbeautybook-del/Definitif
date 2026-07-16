import express from 'express';
import { createCommande, getCommandes, trackOrder } from '../controllers/commande.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createCommande);
router.post('/list', getCommandes);
router.post('/track', trackOrder);

export default router;
