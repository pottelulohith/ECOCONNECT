import { Complaint } from '../models/Complaint.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { PurchaseRequest } from '../models/PurchaseRequest.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { PickupSchedule } from '../models/PickupSchedule.js';

/**
 * @desc    Get aggregated municipal command hub metrics
 * @route   GET /api/municipality/dashboard
 * @access  Private (Municipality)
 */
export async function getDashboard(req, res, next) {
  try {
    const [
      openComplaintsCount,
      activePickupsCount,
      completedPickups,
      inventoryBatches,
      pendingIndustryOrdersCount,
      recentActivity,
    ] = await Promise.all([
      Complaint.countDocuments({ status: { $in: ['Submitted', 'Assigned', 'In Progress'] } }),
      PickupRequest.countDocuments({ status: { $in: ['pending', 'scheduled'] } }),
      PickupRequest.find({ verified: true }).select('weightKg'),
      InventoryBatch.find(),
      PurchaseRequest.countDocuments({ status: 'Pending Review' }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalCollectedKg = completedPickups.reduce((acc, curr) => acc + (curr.weightKg || 0), 0);
    const totalInventoryStockKg = inventoryBatches.reduce((acc, curr) => acc + (curr.currentStockKg || 0), 0);

    res.status(200).json({
      success: true,
      metrics: {
        openComplaints: openComplaintsCount,
        activePickups: activePickupsCount,
        collectedWeightKg: parseFloat(totalCollectedKg.toFixed(1)),
        inventoryStockKg: parseFloat(totalInventoryStockKg.toFixed(1)),
        pendingOrders: pendingIndustryOrdersCount,
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get activity logs
 * @route   GET /api/municipality/activity-logs
 * @access  Private (Municipality)
 */
export async function getActivityLogs(req, res, next) {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      success: true,
      logs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current polymer inventory stock
 * @route   GET /api/municipality/inventory
 * @access  Private (Municipality)
 */
export async function getInventory(req, res, next) {
  try {
    const batches = await InventoryBatch.find().sort({ polymerType: 1 });
    res.status(200).json({
      success: true,
      batches,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get inventory transactions / audit log
 * @route   GET /api/municipality/inventory/transactions
 * @access  Private (Municipality)
 */
export async function getInventoryTransactions(req, res, next) {
  try {
    const transactions = await InventoryTransaction.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get real-time notification counts and items for Municipality
 * @route   GET /api/municipality/notifications
 * @access  Private (Municipality)
 */
export async function getMunicipalityNotifications(req, res, next) {
  try {
    const [
      pendingPurchaseRequests,
      openComplaints,
      pendingPickups,
      awaitingLoadingOrders,
    ] = await Promise.all([
      PurchaseRequest.find({ status: 'Pending Review' }).sort({ createdAt: -1 }),
      Complaint.find({ status: { $in: ['Submitted', 'Assigned', 'In Progress'] } }).sort({ createdAt: -1 }),
      PickupRequest.find({ status: { $in: ['pending', 'scheduled'] } }).sort({ createdAt: -1 }),
      Order.find({ status: 'Truck Dispatched', 'loadingOtp.verified': { $ne: true } }).sort({ updatedAt: -1 }),
    ]);

    const notifications = [];

    pendingPurchaseRequests.forEach((r) => {
      notifications.push({
        id: `pr-${r._id}`,
        title: 'New Purchase Request',
        message: `${r.companyName} requested ${r.quantityKg} kg of ${r.polymerType}`,
        timestamp: r.createdAt,
        type: 'order',
        linkTab: 'orders',
      });
    });

    awaitingLoadingOrders.forEach((o) => {
      notifications.push({
        id: `load-${o._id}`,
        title: 'Loading Verification Required',
        message: `Order ${o.orderId} dispatched truck. Awaiting weighbridge OTP verification.`,
        timestamp: o.updatedAt || o.createdAt,
        type: 'loading',
        linkTab: 'orders',
      });
    });

    openComplaints.forEach((c) => {
      notifications.push({
        id: `comp-${c._id}`,
        title: 'Citizen Complaint Active',
        message: `${c.customId || c.title}: ${c.category} in ${c.location || 'Ward'} (${c.status})`,
        timestamp: c.createdAt,
        type: 'complaint',
        linkTab: 'complaints',
      });
    });

    pendingPickups.forEach((p) => {
      notifications.push({
        id: `pick-${p._id}`,
        title: 'Doorstep Pickup Pending',
        message: `${p.customId}: ${p.citizenName || 'Resident'} requested collection for ${p.requestedDate}`,
        timestamp: p.createdAt,
        type: 'pickup',
        linkTab: 'collections',
      });
    });

    // Sort all notifications by most recent
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Actionable count: items that directly require municipal action/approval
    const actionableCount = pendingPurchaseRequests.length + awaitingLoadingOrders.length;

    res.status(200).json({
      success: true,
      count: actionableCount,
      total: notifications.length,
      badges: {
        complaints: openComplaints.length,
        collections: pendingPickups.length,
        orders: pendingPurchaseRequests.length + awaitingLoadingOrders.length,
      },
      notifications,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Helper: Standardize to DD-MM-YYYY format ───────────────────────────────
function formatToDDMMYYYY(val) {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }
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
 * @desc    Get target wards and citizens for pickup scheduling
 * @route   GET /api/municipality/pickup-schedule/targets
 * @access  Private (Municipality)
 */
export async function getPickupScheduleTargets(req, res, next) {
  try {
    const defaultWards = ['Sector 14', 'Sector 18', 'Zone 4', 'Sector 12', 'Sector 15', 'Central Command Hub'];
    const [userWards, pickupWards, citizens] = await Promise.all([
      User.distinct('ward', { role: 'citizen' }),
      PickupRequest.distinct('ward'),
      User.find({ role: 'citizen' }).select('_id name ward phone email').sort({ name: 1 }),
    ]);

    const combinedWards = Array.from(
      new Set([...defaultWards, ...userWards, ...pickupWards].filter((w) => Boolean(w && w.trim())))
    ).sort();

    res.status(200).json({
      success: true,
      wards: combinedWards,
      citizens: citizens.map((c) => ({
        _id: c._id,
        name: c.name,
        ward: c.ward || 'Sector 14',
        phone: c.phone || '',
        email: c.email || '',
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current pickup schedule for a target
 * @route   GET /api/municipality/pickup-schedule
 * @access  Private (Municipality)
 */
export async function getPickupSchedule(req, res, next) {
  try {
    const { targetType, ward, citizenId } = req.query;

    if (targetType === 'citizen' && citizenId) {
      const schedule = await PickupSchedule.findOne({
        targetType: 'citizen',
        citizenId,
        status: 'scheduled',
      }).sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        schedule: schedule || null,
        scheduledDate: schedule ? schedule.scheduledDate : 'Not Scheduled',
      });
    }

    if (targetType === 'ward' && ward) {
      const schedule = await PickupSchedule.findOne({
        targetType: 'ward',
        ward: { $regex: new RegExp(`^${ward.trim()}$`, 'i') },
        status: 'scheduled',
      }).sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        schedule: schedule || null,
        scheduledDate: schedule ? schedule.scheduledDate : 'Not Scheduled',
      });
    }

    // Return all active schedules
    const allSchedules = await PickupSchedule.find({ status: 'scheduled' }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      schedules: allSchedules,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Save / update pickup schedule for a ward or citizen
 * @route   POST /api/municipality/pickup-schedule
 * @access  Private (Municipality)
 */
export async function savePickupSchedule(req, res, next) {
  try {
    const { targetType = 'ward', ward, citizenId, scheduledDate, notes } = req.body;

    if (!scheduledDate || !String(scheduledDate).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pickup date',
      });
    }

    const formattedDate = formatToDDMMYYYY(scheduledDate);
    if (!formattedDate || !/^\d{2}-\d{2}-\d{4}$/.test(formattedDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please select a valid date.',
      });
    }

    let schedule;
    let targetDescription = '';

    if (targetType === 'citizen') {
      if (!citizenId) {
        return res.status(400).json({
          success: false,
          message: 'Please select a citizen to schedule pickup',
        });
      }

      const citizen = await User.findById(citizenId);
      if (!citizen) {
        return res.status(404).json({
          success: false,
          message: 'Target citizen not found',
        });
      }

      targetDescription = `Citizen ${citizen.name} (${citizen.ward || 'Sector 14'})`;

      schedule = await PickupSchedule.findOneAndUpdate(
        { targetType: 'citizen', citizenId },
        {
          citizenName: citizen.name,
          ward: citizen.ward || 'Sector 14',
          scheduledDate: formattedDate,
          status: 'scheduled',
          notes: notes || '',
          updatedBy: req.user?._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Synchronize any pending pickup requests for this citizen
      await PickupRequest.updateMany(
        { citizenId, status: { $in: ['pending', 'scheduled'] } },
        { $set: { pickupDate: formattedDate, status: 'scheduled' } }
      );
    } else {
      // Target is ward
      const targetWard = (ward || 'Sector 14').trim();
      if (!targetWard) {
        return res.status(400).json({
          success: false,
          message: 'Please select a ward to schedule pickup',
        });
      }

      targetDescription = `Ward ${targetWard}`;

      schedule = await PickupSchedule.findOneAndUpdate(
        { targetType: 'ward', ward: targetWard },
        {
          scheduledDate: formattedDate,
          status: 'scheduled',
          notes: notes || '',
          updatedBy: req.user?._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Synchronize any pending pickup requests in this ward
      await PickupRequest.updateMany(
        {
          ward: { $regex: new RegExp(`^${targetWard}$`, 'i') },
          status: { $in: ['pending', 'scheduled'] },
        },
        { $set: { pickupDate: formattedDate, status: 'scheduled' } }
      );
    }

    // Log Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Pickup Scheduled',
      portal: 'municipality',
      userId: req.user?._id,
      actorName: req.user?.name || 'Municipal Officer',
      description: `Updated pickup schedule for ${targetDescription} to ${formattedDate}`,
      details: {
        targetType,
        target: targetDescription,
        scheduledDate: formattedDate,
      },
    });

    res.status(200).json({
      success: true,
      message: `Pickup schedule saved for ${targetDescription}: ${formattedDate}`,
      schedule,
    });
  } catch (err) {
    next(err);
  }
}

