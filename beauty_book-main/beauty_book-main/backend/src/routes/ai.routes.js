import express from 'express';
import { shAiImageSearch, simulateHairstyle, generateVeoVideo, invokeLLM, analyzePhoto } from '../controllers/ai.controller.js';
import { mariaAgent, mariaAutoReply, voiceboxSpeak, voiceboxStatus } from '../controllers/maria.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/invoke-llm', invokeLLM);
router.post('/analyze-photo', analyzePhoto);
router.post('/image-search', shAiImageSearch);
router.post('/simulate-hairstyle', requireAuth, simulateHairstyle);
router.post('/generate-video', requireAuth, generateVeoVideo);
router.post('/maria', requireAuth, mariaAgent);
router.post('/maria-autoreply', requireAuth, mariaAutoReply);
router.post('/voicebox-speak', voiceboxSpeak);
router.get('/voicebox-status', voiceboxStatus);

export default router;
