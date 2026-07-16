import express from 'express';
import { sendVerificationCode, verifyCode, adminLogin, adminRegister, vendeurLogin, vendeurRegister } from '../controllers/auth.controller.js';

const router = express.Router();

// No requireAuth for these endpoints because they are used *during* authentication flows
router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);

router.post('/admin/login', adminLogin);
router.post('/admin/register', adminRegister);
router.post('/vendeur/login', vendeurLogin);
router.post('/vendeur/register', vendeurRegister);

export default router;
