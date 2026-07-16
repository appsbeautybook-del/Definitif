import express from 'express';
import { getPanier, updatePanier } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPanier);
router.post('/', updatePanier);

export default router;
