import { PickupRequest } from '../models/PickupRequest.js';
import { User } from '../models/User.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { ActivityLog } from '../models/ActivityLog.js';

// Rates in Points per Kg
const POLYMER_RATES = {
  PET: 50,
  'PET Bottles': 50,
  HDPE: 55,
  'HDPE Containers': 55,
  LDPE: 35,
  'LDPE Films': 35,
  PP: 45,
  'PP Rigid': 45,
  'Mixed Polymer': 30,
  Other: 30,
};

/**
 * @desc    Create a new plastic pickup request
 * @route   POST /api/pickups
 * @access  Private (Citizen)
 */
export async function createPickup(req, res, next) {
  try {
    const { requestedDate, slot, notes, photoUrl, photoPublicId } = req.body;

    if (!requestedDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a requested pickup date',
      });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const customId = `#REQ-${randomNum}`;

    const pickup = await PickupRequest.create({
      customId,
      citizenId: req.user._id,
      citizenName: req.user.name,
      citizenPhone: req.user.phone || '',
      ward: req.user.ward || 'Sector 14',
      address: req.user.address || 'Resident Doorstep',
      requestedDate,
      slot: slot || '',
      notes: notes || '',
      photoUrl: photoUrl || null,
      photoPublicId: photoPublicId || null,
      status: 'pending',
      verified: false,
      verifiedWeight: 'Pending',
      rewardOutcome: 'Pending Verification',
    });

    // Create activity log
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Pickup Requested',
      portal: 'citizen',
      userId: req.user._id,
      actorName: req.user.name,
      description: `New doorstep pickup scheduled for ${requestedDate} (${customId})`,
      details: { pickupId: customId, requestedDate, ward: req.user.ward },
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current user's pickup requests
 * @route   GET /api/pickups/mine
 * @access  Private (Citizen)
 */
export async function getMyPickups(req, res, next) {
  try {
    const pickups = await PickupRequest.find({ citizenId: req.user._id }).sort({ createdAt: -1 });

    // Format for citizen frontend table
    const formatted = pickups.map((p) => ({
      _id: p._id,
      id: p.customId,
      date: p.requestedDate,
      slot: p.slot,
      pickupDate: p.pickupDate,
      verified: p.verified,
      weight: p.verifiedWeight,
      reward: p.rewardOutcome,
      status: p.status,
      notes: p.notes,
      photoUrl: p.photoUrl,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      pickups: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get all pickup requests (Municipality queue)
 * @route   GET /api/municipality/pickups
 * @access  Private (Municipality)
 */
export async function getAllPickups(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pickups = await PickupRequest.find(filter)
      .populate('citizenId', 'name email phone ward address')
      .sort({ createdAt: -1 });

    // Format for municipal frontend queue
    const formatted = pickups.map((p) => ({
      _id: p._id,
      id: p.customId,
      citizen: p.citizenName || (p.citizenId && p.citizenId.name) || 'Citizen',
      address: p.address || (p.citizenId && p.citizenId.address) || 'Sector 14 Ward',
      date: p.requestedDate,
      pickupDate: p.pickupDate,
      slot: p.slot,
      status: p.status === 'completed' ? 'Verified' : p.status === 'scheduled' ? 'Scheduled' : 'Pending',
      verified: p.verified,
      weight: p.verifiedWeight,
      weightKg: p.weightKg,
      polymerType: p.polymerType,
      reward: p.rewardOutcome,
      notes: p.notes,
      photoUrl: p.photoUrl,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      pickups: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Schedule a pickup request
 * @route   PATCH /api/municipality/pickups/:id/schedule
 * @access  Private (Municipality)
 */
export async function schedulePickup(req, res, next) {
  try {
    const { pickupDate } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    pickup.pickupDate = pickupDate || new Date().toISOString().split('T')[0];
    pickup.status = 'scheduled';
    await pickup.save();

    res.status(200).json({
      success: true,
      message: 'Pickup scheduled successfully',
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Verify weight, award credits to citizen, and update municipal inventory
 * @route   PATCH /api/municipality/pickups/:id/verify
 * @access  Private (Municipality)
 */
export async function verifyPickup(req, res, next) {
  try {
    const { weightKg, polymerType, notes } = req.body;

    if (!weightKg || Number(weightKg) <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid weight in kg' });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const numWeight = parseFloat(Number(weightKg).toFixed(2));
    const selectedPolymer = polymerType || 'PET Bottles';
    const rate = POLYMER_RATES[selectedPolymer] || 40;
    const creditsAwarded = Math.round(numWeight * rate);

    pickup.weightKg = numWeight;
    pickup.verifiedWeight = `${numWeight} kg`;
    pickup.polymerType = selectedPolymer;
    pickup.verified = true;
    pickup.status = 'completed';
    pickup.pickupDate = pickup.pickupDate || new Date().toISOString().split('T')[0];
    pickup.creditsAwarded = creditsAwarded;
    pickup.rewardOutcome = `+${creditsAwarded} PTS`;
    pickup.verifiedBy = req.user._id;
    pickup.verifiedAt = new Date();
    if (notes) pickup.notes = `${pickup.notes ? pickup.notes + ' | ' : ''}Verification: ${notes}`;

    await pickup.save();

    // 1. Credit the Citizen
    const citizen = await User.findById(pickup.citizenId);
    let newBalance = 0;
    if (citizen) {
      citizen.walletPoints = (citizen.walletPoints || 0) + creditsAwarded;
      await citizen.save();
      newBalance = citizen.walletPoints;

      // Create credit transaction log
      await CreditTransaction.create({
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        citizenId: citizen._id,
        amount: creditsAwarded,
        type: 'pickup_reward',
        description: `Verified ${numWeight} kg of ${selectedPolymer} (${pickup.customId})`,
        balanceAfter: newBalance,
      });
    }

    // 2. Inflow into Municipal Inventory
    // Map polymer category to inventory polymer code (PET, HDPE, LDPE, PP)
    let polymerCode = 'PET';
    if (selectedPolymer.includes('HDPE')) polymerCode = 'HDPE';
    else if (selectedPolymer.includes('LDPE')) polymerCode = 'LDPE';
    else if (selectedPolymer.includes('PP')) polymerCode = 'PP';

    let batch = await InventoryBatch.findOne({ polymerType: polymerCode });
    let prevStock = 0;
    let newStock = numWeight;

    if (batch) {
      prevStock = batch.currentStockKg;
      batch.currentStockKg += numWeight;
      if (batch.status === 'Depleted' || batch.status === 'Low Stock') {
        batch.status = 'In Stock';
      }
      await batch.save();
      newStock = batch.currentStockKg;
    } else {
      // create default batch if none exists
      batch = await InventoryBatch.create({
        batchId: `#BATCH-${polymerCode}-01`,
        polymerType: polymerCode,
        fullName: `${polymerCode} Clean Baled Flakes`,
        grade: 'Grade A (Baled)',
        currentStockKg: numWeight,
        initialStockKg: numWeight,
        minPricePerKg: polymerCode === 'PET' ? 42 : polymerCode === 'HDPE' ? 52 : 38,
        processingCenter: 'Sector 14 MRF Hub',
      });
      newStock = numWeight;
    }

    // Log Inventory Transaction
    await InventoryTransaction.create({
      transactionId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: batch._id,
      polymerType: polymerCode,
      action: 'Direct Intake (Citizen Verified)',
      quantityKg: numWeight,
      previousStockKg: prevStock,
      newStockKg: newStock,
      operator: req.user.name || 'Officer R. Vance',
      notes: `Verified from pickup ${pickup.customId}`,
    });

    // Log Municipal Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Weight Verified',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Municipal Officer',
      description: `Verified ${numWeight} kg (${selectedPolymer}) for ${pickup.citizenName}. +${creditsAwarded} PTS credited.`,
      details: { pickupId: pickup.customId, weightKg: numWeight, creditsAwarded, polymer: selectedPolymer },
    });

    res.status(200).json({
      success: true,
      message: `Pickup verified! Awarded ${creditsAwarded} PTS and updated ${polymerCode} inventory (+${numWeight} kg).`,
      pickup,
      creditsAwarded,
      newCitizenBalance: newBalance,
      updatedInventoryStock: newStock,
    });
  } catch (err) {
    next(err);
  }
}
