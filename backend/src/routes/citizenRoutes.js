import express from 'express';
import {
  getDashboard,
  getCredits,
  getCreditTransactions,
  redeemVoucher,
} from '../controllers/citizenController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('citizen', 'municipality'));

router.get('/dashboard', getDashboard);
router.get('/credits', getCredits);
router.get('/credits/transactions', getCreditTransactions);
router.post('/credits/redeem', redeemVoucher);

export default router;
