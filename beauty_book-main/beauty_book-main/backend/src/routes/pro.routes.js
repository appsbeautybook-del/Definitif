import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfilPro, updateProfilPro } from '../controllers/pro.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/profile/get', getProfilPro);
router.post('/profile/update', updateProfilPro);

export default router;
