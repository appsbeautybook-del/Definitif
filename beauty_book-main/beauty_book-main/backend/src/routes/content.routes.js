import express from 'express';
import { getStyles, getAnnonces, getProduits, getImmobilier } from '../controllers/content.controller.js';

const router = express.Router();

router.post('/styles', getStyles);
router.post('/annonces', getAnnonces);
router.post('/produits', getProduits);
router.post('/immobilier', getImmobilier);

export default router;
