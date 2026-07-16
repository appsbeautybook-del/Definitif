import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { placesAutocomplete } from '../controllers/maps.controller.js';

const router = express.Router();

router.post('/places-autocomplete', requireAuth, placesAutocomplete);

export default router;
