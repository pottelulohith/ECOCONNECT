import express from 'express';
import {
  getDashboard,
  getActivityLogs,
  getInventory,
  getInventoryTransactions,
  getMunicipalityNotifications,
  getPickupScheduleTargets,
  getPickupSchedule,
  savePickupSchedule,
} from '../controllers/municipalityController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

import {
  getAllPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  getMunicipalityOrders,
  verifyLoadingOtp,
} from '../controllers/industryController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('municipality'));

router.get('/dashboard', getDashboard);
router.get('/notifications', getMunicipalityNotifications);
router.get('/activity-logs', getActivityLogs);
router.get('/inventory', getInventory);
router.get('/inventory/transactions', getInventoryTransactions);
router.get('/purchase-requests', getAllPurchaseRequests);
router.patch('/purchase-requests/:id/approve', approvePurchaseRequest);
router.patch('/purchase-requests/:id/reject', rejectPurchaseRequest);

// ── Pickup Schedule management ───────────────────────────────────────────
router.get('/pickup-schedule/targets', getPickupScheduleTargets);
router.get('/pickup-schedule', getPickupSchedule);
router.post('/pickup-schedule', savePickupSchedule);

// ── Order management (loading OTP verification) ──────────────────────────
router.get('/orders', getMunicipalityOrders);
router.post('/orders/:id/verify-loading', verifyLoadingOtp);

export default router;
