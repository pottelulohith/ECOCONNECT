import { User } from '../models/User.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { Complaint } from '../models/Complaint.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { PickupSchedule } from '../models/PickupSchedule.js';

// Helper: Standardize date to DD-MM-YYYY
function formatToDDMMYYYY(val) {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return trimmed;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * @desc    Get aggregated metrics for citizen dashboard
 * @route   GET /api/citizen/dashboard
 * @access  Private (Citizen)
 */
export async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;

    const [user, pickups, complaints, citizenSchedule] = await Promise.all([
      User.findById(userId),
      PickupRequest.find({ citizenId: userId }),
      Complaint.find({ citizenId: userId }),
      PickupSchedule.findOne({ targetType: 'citizen', citizenId: userId, status: 'scheduled' }).sort({ updatedAt: -1 }),
    ]);

    const verifiedPickups = pickups.filter((p) => p.verified);
    const totalRecycledKg = verifiedPickups.reduce((acc, p) => acc + (p.weightKg || 0), 0);
    const resolvedIssuesCount = complaints.filter((c) => c.status === 'Resolved').length;

    // Upcoming scheduled pickup resolution:
    // 1. Direct citizen schedule
    let nextPickupDate = 'Not Scheduled';
    if (citizenSchedule && citizenSchedule.scheduledDate) {
      nextPickupDate = citizenSchedule.scheduledDate;
    } else if (user && user.ward) {
      // 2. Ward schedule
      const wardSchedule = await PickupSchedule.findOne({
        targetType: 'ward',
        ward: { $regex: new RegExp(`^${user.ward.trim()}$`, 'i') },
        status: 'scheduled',
      }).sort({ updatedAt: -1 });

      if (wardSchedule && wardSchedule.scheduledDate) {
        nextPickupDate = wardSchedule.scheduledDate;
      }
    }

    // 3. Fallback: check individual scheduled pickup request
    if (nextPickupDate === 'Not Scheduled') {
      const upcomingPickup = pickups.find((p) => p.status === 'scheduled' && p.pickupDate);
      if (upcomingPickup) {
        nextPickupDate = upcomingPickup.pickupDate;
      }
    }

    // Format to DD-MM-YYYY if valid scheduled date
    if (nextPickupDate !== 'Not Scheduled') {
      nextPickupDate = formatToDDMMYYYY(nextPickupDate);
    }

    res.status(200).json({
      success: true,
      metrics: {
        recycledWeightKg: parseFloat(totalRecycledKg.toFixed(1)),
        walletPoints: user ? user.walletPoints : 0,
        resolvedIssues: resolvedIssuesCount,
        nextPickup: nextPickupDate,
      },
      recentPickups: pickups.slice(0, 5),
      recentComplaints: complaints.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get citizen credits balance
 * @route   GET /api/citizen/credits
 * @access  Private (Citizen)
 */
export async function getCredits(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      walletPoints: user ? user.walletPoints : 0,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get credit transaction history
 * @route   GET /api/citizen/credits/transactions
 * @access  Private (Citizen)
 */
export async function getCreditTransactions(req, res, next) {
  try {
    const txns = await CreditTransaction.find({ citizenId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions: txns,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Redeem a civic perk/voucher with points
 * @route   POST /api/citizen/credits/redeem
 * @access  Private (Citizen)
 */
export async function redeemVoucher(req, res, next) {
  try {
    const { perkTitle, cost } = req.body;
    const pointCost = Number(cost);

    if (!pointCost || pointCost <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid point cost' });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.walletPoints < pointCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points in your green wallet',
      });
    }

    user.walletPoints -= pointCost;
    await user.save();

    const voucherCode = `ECO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const txn = await CreditTransaction.create({
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: user._id,
      amount: -pointCost,
      type: 'voucher_redemption',
      description: `Redeemed: ${perkTitle || 'Civic Perk'} (Code: ${voucherCode})`,
      balanceAfter: user.walletPoints,
    });

    res.status(200).json({
      success: true,
      message: 'Perk redeemed successfully!',
      voucherCode,
      newBalance: user.walletPoints,
      transaction: txn,
    });
  } catch (err) {
    next(err);
  }
}
