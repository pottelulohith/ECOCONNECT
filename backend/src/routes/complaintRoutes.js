import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignTeam,
  updateComplaintStatus,
  completeWork,
} from '../controllers/complaintController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Citizen routes
router.post('/', requireAuth, requireRole('citizen', 'municipality'), createComplaint);
router.get('/mine', requireAuth, getMyComplaints);

// Municipality routes
router.get('/', requireAuth, requireRole('municipality'), getAllComplaints);
router.patch('/:id/assign', requireAuth, requireRole('municipality'), assignTeam);
router.patch('/:id/status', requireAuth, requireRole('municipality'), updateComplaintStatus);
router.patch('/:id/complete', requireAuth, requireRole('municipality'), completeWork);

export default router;
