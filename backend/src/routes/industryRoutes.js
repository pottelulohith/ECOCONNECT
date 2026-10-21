import express from 'express';
import {
  getDashboard,
  getMarketplace,
  createPurchaseRequest,
  getMyPurchaseRequests,
  getAllPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  getOrders,
  updateDriverDetails,
  dispatchTruck,
  generateLoadingOtp,
  generateDeliveryOtp,
  verifyDelivery,
  getMunicipalityOrders,
  verifyLoadingOtp,
  getIndustryNotifications,
} from '../controllers/industryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Industry routes ──────────────────────────────────────────────────────
router.get('/dashboard', requireAuth, requireRole('industry', 'municipality'), getDashboard);
router.get('/notifications', requireAuth, requireRole('industry'), getIndustryNotifications);
router.get('/marketplace', requireAuth, getMarketplace);
router.post('/purchase-requests', requireAuth, requireRole('industry', 'municipality'), createPurchaseRequest);
router.get('/purchase-requests/mine', requireAuth, getMyPurchaseRequests);
router.get('/orders', requireAuth, getOrders);

// Industry order management
router.patch('/orders/:id/driver', requireAuth, requireRole('industry'), updateDriverDetails);
router.patch('/orders/:id/dispatch', requireAuth, requireRole('industry'), dispatchTruck);
router.post('/orders/:id/loading-otp', requireAuth, requireRole('industry'), generateLoadingOtp);
router.post('/orders/:id/delivery-otp', requireAuth, requireRole('industry'), generateDeliveryOtp);
router.post('/orders/:id/verify-delivery', requireAuth, requireRole('industry'), verifyDelivery);

// ── Municipality routes for approving/rejecting industry orders ──────────
router.get('/purchase-requests', requireAuth, requireRole('municipality'), getAllPurchaseRequests);
router.patch('/purchase-requests/:id/approve', requireAuth, requireRole('municipality'), approvePurchaseRequest);
router.patch('/purchase-requests/:id/reject', requireAuth, requireRole('municipality'), rejectPurchaseRequest);

export default router;
