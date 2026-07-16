import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { approvePro, adminCreateService, manageStyle, manageAnnonce, adminApi } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(requireAuth);
// Ensure only admins can access these routes
router.use(requireRole('admin'));

router.post('/approve-pro', approvePro);
router.post('/create-service', adminCreateService);
router.post('/manage-style', manageStyle);
router.post('/annonce', manageAnnonce);
router.post('/api', adminApi);

export default router;
