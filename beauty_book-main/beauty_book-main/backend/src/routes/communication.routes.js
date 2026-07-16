import express from 'express';
import { getMessages, sendMessage } from '../controllers/chat.controller.js';
import { getNotifications, markNotificationsRead } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/messages/get', requireAuth, getMessages);
router.post('/messages/send', requireAuth, sendMessage);

router.post('/notifications/get', requireAuth, getNotifications);
router.post('/notifications/mark-read', requireAuth, markNotificationsRead);

export default router;
