import express from 'express';
import { getHomeData, getReels, likeReel, searchMusic } from '../controllers/feed.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/home', getHomeData);
router.post('/reels', getReels);
router.post('/reels/like', requireAuth, likeReel);
router.post('/music/search', searchMusic);

export default router;
