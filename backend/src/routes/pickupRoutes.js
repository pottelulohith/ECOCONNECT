import express from 'express';
import {
  createPickup,
  getMyPickups,
  getAllPickups,
  schedulePickup,
  verifyPickup,
} from '../controllers/pickupController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Citizen routes
router.post('/', requireAuth, requireRole('citizen', 'municipality'), createPickup);
router.get('/mine', requireAuth, getMyPickups);

// Municipality routes
router.get('/', requireAuth, requireRole('municipality'), getAllPickups);
router.patch('/:id/schedule', requireAuth, requireRole('municipality'), schedulePickup);
router.patch('/:id/verify', requireAuth, requireRole('municipality'), verifyPickup);

export default router;
