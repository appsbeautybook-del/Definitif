import express from 'express';
import { createReservation } from '../controllers/reservation.controller.js';
import { completeReservation, updateReservation, getReservations } from '../controllers/reservationExtra.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All reservation routes require authentication
router.use(requireAuth);

router.post('/', createReservation);
router.post('/complete', completeReservation);
router.post('/list', getReservations);
router.put('/:id', updateReservation);

export default router;
