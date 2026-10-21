import crypto from 'crypto';
import { PurchaseRequest } from '../models/PurchaseRequest.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { Order } from '../models/Order.js';
import { ActivityLog } from '../models/ActivityLog.js';

// ─── Helper: generate a 6-digit OTP ────────────────────────────────────────
function generateOtp() {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, hash };
}

// ─── Helper: build default 5 progress steps ────────────────────────────────
function buildProgressSteps(currentStep = 1) {
  const labels = [
    'Request Sent',
    'Request Approved',
    'Truck Dispatched',
    'Loading OTP',
    'Return to Industry',
  ];
  return labels.map((label, i) => ({
    step: i + 1,
    label,
    completed: i + 1 < currentStep,
    current: i + 1 === currentStep,
    completedAt: i + 1 < currentStep ? new Date() : null,
  }));
}

/**
 * @desc    Get Industry dashboard metrics
 * @route   GET /api/industry/dashboard
 * @access  Private (Industry)
 */
export async function getDashboard(req, res, next) {
  try {
    const industryId = req.user._id;

    const [requests, orders] = await Promise.all([
      PurchaseRequest.find({ industryId }),
      Order.find({ industryId }),
    ]);

    const completedOrders = requests.filter((r) => r.status === 'Approved' || r.status === 'Fulfilled');
    const totalProcuredKg = completedOrders.reduce((acc, curr) => acc + (curr.quantityKg || 0), 0);
    const totalSpent = completedOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const activeRequestsCount = requests.filter((r) => r.status === 'Pending Review').length;
    const inTransitCount = orders.filter((o) => ['In Transit', 'Truck Dispatched'].includes(o.status)).length;

    // Procurement & Dispatch audit trail (strictly exclude citizen PII and non-procurement activities)
    const procurementActionPatterns = [
      /PURCHASE/i,
      /ORDER/i,
      /DISPATCH/i,
      /DELIVER/i,
      /LOADING/i,
      /BATCH/i,
      /STOCK/i,
      /FREIGHT/i,
      /TRUCK/i,
    ];

    const rawActivity = await ActivityLog.find({
      portal: { $ne: 'citizen' },
      $or: [
        { portal: 'industry' },
        { action: { $in: ['Loading Verified', 'Truck Dispatched', 'Order Delivered', 'PURCHASE_REQUEST_APPROVED', 'PURCHASE_REQUEST_REJECTED', 'PURCHASE_REQUEST_SUBMITTED', 'ORDER_DISPATCHED', 'LOADING_OTP_VERIFIED'] } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Sanitize audit records: only display necessary procurement/dispatch info, completely stripping citizen PII
    const sanitizedActivity = rawActivity
      .filter((item) => {
        // Exclude citizen complaints and household pickups
        const act = (item.action || '').toUpperCase();
        if (act.includes('COMPLAINT') || act.includes('PICKUP') || act.includes('CITIZEN')) return false;
        return true;
      })
      .slice(0, 6)
      .map((item) => {
        // Redact any phone numbers or email addresses
        let cleanDesc = (item.description || '')
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Contact Protected]')
          .replace(/(\+91[\s-]?)?[6-9]\d{9}/g, '[Contact Protected]');

        return {
          _id: item._id,
          action: item.action,
          description: cleanDesc,
          timestamp: item.timestamp || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'),
          createdAt: item.createdAt,
        };
      });

    res.status(200).json({
      success: true,
      metrics: {
        totalProcuredKg: totalProcuredKg || 0,
        totalSpent: totalSpent || 0,
        activeRequests: activeRequestsCount,
        inTransitDeliveries: inTransitCount,
      },
      recentActivity: sanitizedActivity,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get marketplace batches available for purchase
 * @route   GET /api/industry/marketplace
 * @access  Private (Industry)
 */
export async function getMarketplace(req, res, next) {
  try {
    const batches = await InventoryBatch.find({ currentStockKg: { $gt: 0 } });

    // Format for Industry Marketplace cards
    const marketplaceBatches = batches.map((b) => ({
      id: b.batchId,
      _id: b._id,
      polymer: b.polymerType,
      name: b.fullName || `${b.polymerType} Industrial Flakes`,
      grade: b.grade,
      purity: `${b.purityPercent}% Clean`,
      availableKg: b.currentStockKg,
      pricePerKg: b.minPricePerKg,
      hub: b.processingCenter,
      status: b.status,
    }));

    res.status(200).json({
      success: true,
      batches: marketplaceBatches,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create purchase request from industry
 * @route   POST /api/industry/purchase-requests
 * @access  Private (Industry)
 */
export async function createPurchaseRequest(req, res, next) {
  try {
    const { polymerType, quantityKg, ratePerKg, deliveryAddress, requestedDelivery, notes } = req.body;

    if (!polymerType || !quantityKg || Number(quantityKg) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide polymer type and valid quantity in kg',
      });
    }

    const qty = Number(quantityKg);
    const rate = Number(ratePerKg) || (polymerType === 'HDPE' ? 55 : polymerType === 'PET' ? 42 : 38);
    const totalAmount = Math.round(qty * rate);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const customId = `#ORD-${randomNum}`;

    const purchaseRequest = await PurchaseRequest.create({
      customId,
      industryId: req.user._id,
      companyName: req.user.companyName || req.user.name || 'Green Polymer Industries',
      buyerGst: req.user.gstNumber || '07AABCU9603R1ZM',
      polymerType,
      quantityKg: qty,
      ratePerKg: rate,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.facilityLocation || 'Sector 18 Industrial Area',
      requestedDelivery: requestedDelivery || 'Within 48h (Urgent)',
      reviewNotes: notes || '',
      status: 'Pending Review',
    });

    // Log Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Purchase Request Placed',
      portal: 'industry',
      userId: req.user._id,
      actorName: req.user.name,
      description: `New purchase request ${customId} for ${qty} kg of ${polymerType} (₹${totalAmount.toLocaleString('en-IN')})`,
      details: { requestId: customId, polymer: polymerType, qty, totalAmount },
    });

    res.status(201).json({
      success: true,
      message: 'Purchase request placed successfully and submitted to Municipality for verification.',
      purchaseRequest,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get Industry's own purchase requests
 * @route   GET /api/industry/purchase-requests
 * @access  Private (Industry)
 */
export async function getMyPurchaseRequests(req, res, next) {
  try {
    const requests = await PurchaseRequest.find({ industryId: req.user._id }).sort({ createdAt: -1 });

    const formatted = requests.map((r) => ({
      _id: r._id,
      id: r.customId,
      polymer: r.polymerType,
      quantity: `${r.quantityKg.toLocaleString()} kg`,
      quantityKg: r.quantityKg,
      rate: `₹${r.ratePerKg}/kg`,
      ratePerKg: r.ratePerKg,
      total: `₹${r.totalAmount.toLocaleString('en-IN')}`,
      totalAmount: r.totalAmount,
      date: r.createdAt.toISOString().split('T')[0],
      delivery: r.requestedDelivery,
      status: r.status,
      payment: r.paymentStatus,
      notes: r.reviewNotes,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      requests: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get all purchase requests for Municipality review
 * @route   GET /api/municipality/purchase-requests
 * @access  Private (Municipality)
 */
export async function getAllPurchaseRequests(req, res, next) {
  try {
    const requests = await PurchaseRequest.find().sort({ createdAt: -1 });

    // Cross-reference with Order collection to ensure delivered and fulfilled requests reflect terminal status
    const orders = await Order.find().select('purchaseRequestId status');
    const orderStatusMap = new Map();
    orders.forEach((o) => {
      if (o.purchaseRequestId) {
        orderStatusMap.set(o.purchaseRequestId.toString(), o.status);
      }
    });

    const formatted = requests.map((r) => {
      let finalStatus = r.status;
      const linkedOrderStatus = orderStatusMap.get(r._id.toString());
      if (linkedOrderStatus === 'Delivered' || finalStatus === 'Fulfilled' || finalStatus === 'Delivered') {
        finalStatus = 'Fulfilled';
      } else if (linkedOrderStatus) {
        finalStatus = 'Approved';
      }

      return {
        _id: r._id,
        id: r.customId,
        company: r.companyName,
        polymer: r.polymerType,
        quantity: `${r.quantityKg.toLocaleString()} kg`,
        quantityKg: r.quantityKg,
        rate: `₹${r.ratePerKg}/kg`,
        ratePerKg: r.ratePerKg,
        total: `₹${r.totalAmount.toLocaleString('en-IN')}`,
        totalAmount: r.totalAmount,
        requestedDelivery: r.requestedDelivery,
        paymentStatus: r.paymentStatus,
        status: finalStatus === 'Pending Review' ? 'Pending' : finalStatus,
        reviewNotes: r.reviewNotes,
        createdAt: r.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      orders: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Approve an industry purchase request
 * @route   PATCH /api/municipality/purchase-requests/:id/approve
 * @access  Private (Municipality)
 */
export async function approvePurchaseRequest(req, res, next) {
  try {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }

    if (['Approved', 'Fulfilled', 'Delivered', 'Completed'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Order is already ${request.status.toLowerCase()} and cannot be approved again` });
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Order has already been rejected' });
    }

    // 1. Mark request approved
    request.status = 'Approved';
    request.approvedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // 2. Generate Order / Delivery Record with 5-step progress
    const deliveryCustomId = `#DEL-${Math.floor(8000 + Math.random() * 1999)}`;
    const now = new Date();

    const order = await Order.create({
      orderId: deliveryCustomId,
      purchaseRequestId: request._id,
      industryId: request.industryId,
      polymer: `${request.polymerType} Baled Industrial Flakes`,
      quantityKg: request.quantityKg,
      totalAmount: request.totalAmount,
      status: 'Approved',
      eta: '',
      destination: request.deliveryAddress || 'Sector 18 Industrial Area, Warehouse 3',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      trip1: {
        label: 'Industry → Municipality',
        status: 'Pending',
      },
      trip2: {
        label: 'Municipality → Industry',
        status: 'Pending',
      },
      progressSteps: buildProgressSteps(2), // Step 1 (Request Sent) done, Step 2 (Approved) is current
      timeline: [
        {
          event: 'Request Sent',
          description: `Purchase request ${request.customId} submitted by industry.`,
          timestamp: request.createdAt,
          actor: request.companyName,
          actorRole: 'industry',
        },
        {
          event: 'Request Approved',
          description: `Purchase request approved by municipality. Order ${deliveryCustomId} created.`,
          timestamp: now,
          actor: req.user.name || 'Municipality Officer',
          actorRole: 'municipality',
        },
      ],
    });

    // 3. Activity Log
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Order Approved',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Municipality Officer',
      description: `Approved ${request.customId} for ${request.companyName} (${request.quantityKg} kg ${request.polymerType}). Order created: ${deliveryCustomId}.`,
      details: { requestId: request.customId, deliveryId: deliveryCustomId },
    });

    res.status(200).json({
      success: true,
      message: `Order approved! Order ${deliveryCustomId} created. Industry can now dispatch truck.`,
      request,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Reject an industry purchase request
 * @route   PATCH /api/municipality/purchase-requests/:id/reject
 * @access  Private (Municipality)
 */
export async function rejectPurchaseRequest(req, res, next) {
  try {
    const { reason } = req.body;
    const request = await PurchaseRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }

    if (['Approved', 'Fulfilled', 'Delivered', 'Completed'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot reject an order that is already ${request.status.toLowerCase()}` });
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Order has already been rejected' });
    }

    request.status = 'Rejected';
    request.reviewNotes = reason || 'Stock allocation unavailable';
    request.reviewedAt = new Date();
    await request.save();

    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Order Rejected',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Municipality Officer',
      description: `Rejected order ${request.customId} from ${request.companyName}. Reason: ${request.reviewNotes}`,
    });

    res.status(200).json({
      success: true,
      message: 'Purchase request rejected',
      request,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get Industry shipments / orders
 * @route   GET /api/industry/orders
 * @access  Private (Industry)
 */
export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({ industryId: req.user._id }).sort({ createdAt: -1 });

    const formatted = orders.map((o) => ({
      _id: o._id,
      id: o.orderId,
      polymer: o.polymer,
      quantity: `${o.quantityKg.toLocaleString()} kg`,
      quantityKg: o.quantityKg,
      totalAmount: o.totalAmount,
      status: o.status,
      eta: o.eta,
      destination: o.destination,
      vehicleNo: o.vehicleNo,
      driverName: o.driverName,
      driverPhone: o.driverPhone,
      driverUpdatedAt: o.driverUpdatedAt,
      trip1: o.trip1,
      trip2: o.trip2,
      progressSteps: o.progressSteps,
      loadingOtp: o.loadingOtp
        ? {
            otpPlain: o.loadingOtp.otpPlain || null,
            expiresAt: o.loadingOtp.expiresAt,
            verified: o.loadingOtp.verified,
            verifiedAt: o.loadingOtp.verifiedAt,
            generatedAt: o.loadingOtp.generatedAt,
            attempts: o.loadingOtp.attempts,
            maxAttempts: o.loadingOtp.maxAttempts,
          }
        : null,
      actualLoadedKg: o.actualLoadedKg,
      deliveryOtp: o.deliveryOtp
        ? {
            otpPlain: o.deliveryOtp.otpPlain || null,
            expiresAt: o.deliveryOtp.expiresAt,
            verified: o.deliveryOtp.verified,
            verifiedAt: o.deliveryOtp.verifiedAt,
            generatedAt: o.deliveryOtp.generatedAt,
          }
        : null,
      actualDeliveredKg: o.actualDeliveredKg,
      reconciliation: o.reconciliation,
      timeline: o.timeline,
      currentLocation: o.currentLocation,
      coords: o.coords,
      milestones: o.milestones,
      createdAt: o.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      shipments: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update driver and truck details for an order
 * @route   PATCH /api/industry/orders/:id/driver
 * @access  Private (Industry)
 */
export async function updateDriverDetails(req, res, next) {
  try {
    const { driverName, driverPhone, vehicleNo } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    // Validate driver name
    if (driverName !== undefined) {
      if (!driverName || driverName.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Driver name must be at least 2 characters' });
      }
      order.driverName = driverName.trim();
    }

    // Validate driver phone
    if (driverPhone !== undefined) {
      const phoneClean = driverPhone.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{10,13}$/.test(phoneClean)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
      }
      order.driverPhone = driverPhone.trim();
    }

    // Validate vehicle number
    if (vehicleNo !== undefined) {
      if (!vehicleNo || vehicleNo.trim().length < 4) {
        return res.status(400).json({ success: false, message: 'Vehicle number must be at least 4 characters' });
      }
      order.vehicleNo = vehicleNo.trim().toUpperCase();
    }

    order.driverUpdatedAt = new Date();

    // Add timeline event
    order.timeline.push({
      event: 'Driver/Truck Details Updated',
      description: `Driver: ${order.driverName}, Phone: ${order.driverPhone}, Vehicle: ${order.vehicleNo}`,
      timestamp: new Date(),
      actor: req.user.name || req.user.companyName || 'Industry',
      actorRole: 'industry',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Driver and truck details updated successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Dispatch truck (move to "Truck Dispatched" status)
 * @route   PATCH /api/industry/orders/:id/dispatch
 * @access  Private (Industry)
 */
export async function dispatchTruck(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!order.driverName || !order.driverPhone || !order.vehicleNo) {
      return res.status(400).json({
        success: false,
        message: 'Please set driver name, phone, and vehicle number before dispatching',
      });
    }

    if (!['Approved'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot dispatch truck. Current status: ${order.status}`,
      });
    }

    order.status = 'Truck Dispatched';
    order.trip1 = {
      ...order.trip1.toObject(),
      status: 'In Transit',
      startedAt: new Date(),
    };

    // Update progress steps - mark step 3 (Truck Dispatched) as current
    order.progressSteps = buildProgressSteps(3);

    order.timeline.push({
      event: 'Truck Dispatched',
      description: `Truck ${order.vehicleNo} dispatched with driver ${order.driverName} (${order.driverPhone}). Trip 1: Industry → Municipality.`,
      timestamp: new Date(),
      actor: req.user.name || req.user.companyName || 'Industry',
      actorRole: 'industry',
    });

    await order.save();

    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Truck Dispatched',
      portal: 'industry',
      userId: req.user._id,
      actorName: req.user.name || 'Industry',
      description: `Truck ${order.vehicleNo} dispatched for order ${order.orderId}`,
    });

    res.status(200).json({
      success: true,
      message: 'Truck dispatched successfully!',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Generate Loading OTP (Industry generates, shown to Industry)
 * @route   POST /api/industry/orders/:id/loading-otp
 * @access  Private (Industry)
 */
export async function generateLoadingOtp(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['Truck Dispatched'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate loading OTP. Current status: ${order.status}`,
      });
    }

    if (order.loadingOtp?.verified) {
      return res.status(400).json({ success: false, message: 'Loading OTP already verified' });
    }

    const { otp, hash } = generateOtp();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    order.loadingOtp = {
      otpHash: hash,
      otpPlain: otp, // stored for Industry to view
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      verifiedAt: null,
      verifiedBy: null,
      generatedAt: new Date(),
    };

    // Update progress: step 4 (Loading OTP) is now current
    order.progressSteps = buildProgressSteps(4);

    order.timeline.push({
      event: 'Loading OTP Generated',
      description: `Loading OTP generated by industry. Valid for 30 minutes.`,
      timestamp: new Date(),
      actor: req.user.name || req.user.companyName || 'Industry',
      actorRole: 'industry',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Loading OTP generated successfully',
      loadingOtp: {
        otp: otp, // Shown to industry
        expiresAt,
        generatedAt: order.loadingOtp.generatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Verify Loading OTP (Municipality enters OTP + actual weight)
 * @route   POST /api/municipality/orders/:id/verify-loading
 * @access  Private (Municipality)
 */
export async function verifyLoadingOtp(req, res, next) {
  try {
    const { otp, actualLoadedKg } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!otp || !actualLoadedKg || Number(actualLoadedKg) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide OTP and actual loaded weight (kg)' });
    }

    if (!order.loadingOtp?.otpHash) {
      return res.status(400).json({ success: false, message: 'No loading OTP has been generated for this order' });
    }

    if (order.loadingOtp.verified) {
      return res.status(400).json({ success: false, message: 'Loading OTP already verified' });
    }

    // Check expiry
    if (new Date() > new Date(order.loadingOtp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Loading OTP has expired. Ask Industry to generate a new one.' });
    }

    // Check attempts
    if (order.loadingOtp.attempts >= order.loadingOtp.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Maximum OTP attempts exceeded. Ask Industry to generate a new OTP.' });
    }

    // Verify hash
    const inputHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    order.loadingOtp.attempts += 1;

    if (inputHash !== order.loadingOtp.otpHash) {
      await order.save();
      const remaining = order.loadingOtp.maxAttempts - order.loadingOtp.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
    }

    // OTP verified!
    order.loadingOtp.verified = true;
    order.loadingOtp.verifiedAt = new Date();
    order.loadingOtp.verifiedBy = req.user._id;
    order.actualLoadedKg = Number(actualLoadedKg);

    // Deduct from inventory
    const polymerType = order.polymer.split(' ')[0]; // e.g., "PET"
    const batch = await InventoryBatch.findOne({ polymerType });
    if (batch) {
      const prevStock = batch.currentStockKg;
      batch.currentStockKg = Math.max(0, batch.currentStockKg - Number(actualLoadedKg));
      if (batch.currentStockKg === 0) {
        batch.status = 'Depleted';
      } else if (batch.currentStockKg < 200) {
        batch.status = 'Low Stock';
      }
      await batch.save();

      await InventoryTransaction.create({
        transactionId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        batchId: batch._id,
        polymerType,
        action: `Loaded for order ${order.orderId}`,
        quantityKg: -Number(actualLoadedKg),
        previousStockKg: prevStock,
        newStockKg: batch.currentStockKg,
        operator: req.user.name || 'Municipality Officer',
        notes: `Loading OTP verified. Actual loaded: ${actualLoadedKg} kg.`,
      });
    }

    // Trip 1 complete, Trip 2 starts
    order.status = 'In Transit';
    order.trip1 = {
      ...order.trip1.toObject(),
      status: 'Completed',
      completedAt: new Date(),
    };
    order.trip2 = {
      ...order.trip2.toObject(),
      status: 'In Transit',
      startedAt: new Date(),
    };

    // Update progress: step 5 (Return to Industry) is now current
    order.progressSteps = buildProgressSteps(5);

    order.timeline.push({
      event: 'Loading OTP Verified',
      description: `Loading OTP verified by municipality. Actual loaded weight: ${actualLoadedKg} kg (requested: ${order.quantityKg} kg). Trip 2 started: Municipality → Industry.`,
      timestamp: new Date(),
      actor: req.user.name || 'Municipality Officer',
      actorRole: 'municipality',
    });

    await order.save();

    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Loading Verified',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Municipality Officer',
      description: `Loading OTP verified for order ${order.orderId}. Loaded ${actualLoadedKg} kg. Return trip started.`,
    });

    res.status(200).json({
      success: true,
      message: `Loading verified! ${actualLoadedKg} kg loaded. Return trip (Municipality → Industry) started.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Generate Delivery OTP (separate from loading OTP)
 * @route   POST /api/industry/orders/:id/delivery-otp
 * @access  Private (Industry)
 */
export async function generateDeliveryOtp(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!order.loadingOtp?.verified) {
      return res.status(400).json({ success: false, message: 'Loading OTP must be verified first' });
    }

    if (order.deliveryOtp?.verified) {
      return res.status(400).json({ success: false, message: 'Delivery OTP already verified' });
    }

    const { otp, hash } = generateOtp();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    order.deliveryOtp = {
      otpHash: hash,
      otpPlain: otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      verifiedAt: null,
      verifiedBy: null,
      generatedAt: new Date(),
    };

    order.timeline.push({
      event: 'Delivery OTP Generated',
      description: `Delivery OTP generated by industry. Valid for 1 hour.`,
      timestamp: new Date(),
      actor: req.user.name || req.user.companyName || 'Industry',
      actorRole: 'industry',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery OTP generated successfully',
      deliveryOtp: {
        otp,
        expiresAt,
        generatedAt: order.deliveryOtp.generatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Verify Delivery & Reconciliation (Industry verifies delivery)
 * @route   POST /api/industry/orders/:id/verify-delivery
 * @access  Private (Industry)
 */
export async function verifyDelivery(req, res, next) {
  try {
    const { otp, actualDeliveredKg, reconciliationNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.industryId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Order is already marked as delivered' });
    }

    // Preserve deliveryOtp record if present
    if (order.deliveryOtp) {
      order.deliveryOtp.verified = true;
      order.deliveryOtp.verifiedAt = new Date();
      order.deliveryOtp.verifiedBy = req.user._id;
    }

    order.actualDeliveredKg = actualDeliveredKg ? Number(actualDeliveredKg) : (order.actualLoadedKg || order.quantityKg);

    order.status = 'Delivered';
    order.trip2 = {
      ...(order.trip2 ? (order.trip2.toObject ? order.trip2.toObject() : order.trip2) : {}),
      status: 'Completed',
      completedAt: new Date(),
    };

    // Mark all progress steps completed
    order.progressSteps = order.progressSteps.map((s) => ({
      ...s.toObject ? s.toObject() : s,
      completed: true,
      current: false,
      completedAt: s.completedAt || new Date(),
    }));

    // Reconciliation
    const weightDiff = (order.actualDeliveredKg || 0) - (order.actualLoadedKg || order.quantityKg);
    order.reconciliation = {
      weightDiffKg: weightDiff,
      notes: reconciliationNotes || '',
      reconciledAt: new Date(),
    };

    order.timeline.push({
      event: 'Delivery Confirmed',
      description: `Delivery confirmed at industry facility. Delivered: ${order.actualDeliveredKg} kg. Weight diff: ${weightDiff >= 0 ? '+' : ''}${weightDiff} kg.`,
      timestamp: new Date(),
      actor: req.user.name || req.user.companyName || 'Industry',
      actorRole: 'industry',
    });

    // Mark purchase request as fulfilled
    if (order.purchaseRequestId) {
      await PurchaseRequest.findByIdAndUpdate(order.purchaseRequestId, { status: 'Fulfilled' });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery verified and order completed!',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get all orders for Municipality (to verify loading)
 * @route   GET /api/municipality/orders
 * @access  Private (Municipality)
 */
export async function getMunicipalityOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate('industryId', 'name companyName email')
      .sort({ createdAt: -1 });

    const formatted = orders.map((o) => ({
      _id: o._id,
      id: o.orderId,
      polymer: o.polymer,
      quantity: `${o.quantityKg.toLocaleString()} kg`,
      quantityKg: o.quantityKg,
      totalAmount: o.totalAmount,
      status: o.status,
      destination: o.destination,
      vehicleNo: o.vehicleNo,
      driverName: o.driverName,
      driverPhone: o.driverPhone,
      trip1: o.trip1,
      trip2: o.trip2,
      progressSteps: o.progressSteps,
      loadingOtp: o.loadingOtp
        ? {
            expiresAt: o.loadingOtp.expiresAt,
            verified: o.loadingOtp.verified,
            verifiedAt: o.loadingOtp.verifiedAt,
            attempts: o.loadingOtp.attempts,
            maxAttempts: o.loadingOtp.maxAttempts,
            generatedAt: o.loadingOtp.generatedAt,
            // DO NOT send otpPlain to municipality
          }
        : null,
      actualLoadedKg: o.actualLoadedKg,
      timeline: o.timeline,
      industry: o.industryId
        ? {
            name: o.industryId.name || o.industryId.companyName,
            email: o.industryId.email,
          }
        : null,
      createdAt: o.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      orders: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get real-time notification counts and items for Industry
 * @route   GET /api/industry/notifications
 * @access  Private (Industry)
 */
export async function getIndustryNotifications(req, res, next) {
  try {
    const industryId = req.user._id;
    const [pendingRequests, readyOrders, inTransitOrders] = await Promise.all([
      PurchaseRequest.find({ industryId, status: 'Pending Review' }).sort({ createdAt: -1 }),
      Order.find({ industryId, status: 'Approved' }).sort({ createdAt: -1 }),
      Order.find({ industryId, status: { $in: ['Truck Dispatched', 'In Transit'] } }).sort({ createdAt: -1 }),
    ]);

    const notifications = [];

    readyOrders.forEach((o) => {
      notifications.push({
        id: `ord-${o._id}`,
        title: 'Order Approved - Ready for Dispatch',
        message: `Order ${o.orderId} (${o.polymer}) approved by Municipality. Please assign driver and dispatch truck.`,
        timestamp: o.updatedAt || o.createdAt,
        type: 'order',
        linkTab: 'deliveries',
      });
    });

    inTransitOrders.forEach((o) => {
      notifications.push({
        id: `del-${o._id}`,
        title: 'Shipment In Progress',
        message: `Order ${o.orderId} is currently ${o.status}. Awaiting unloading & verification.`,
        timestamp: o.updatedAt || o.createdAt,
        type: 'delivery',
        linkTab: 'deliveries',
      });
    });

    pendingRequests.forEach((r) => {
      notifications.push({
        id: `req-${r._id}`,
        title: 'Purchase Request Under Review',
        message: `Request ${r.customId} for ${r.quantityKg} kg ${r.polymerType} is awaiting municipal quota approval.`,
        timestamp: r.createdAt,
        type: 'request',
        linkTab: 'requests',
      });
    });

    // Actionable count: orders awaiting truck dispatch or in transit
    const actionableCount = readyOrders.length + inTransitOrders.length;

    res.status(200).json({
      success: true,
      count: actionableCount,
      total: notifications.length,
      badges: {
        requests: pendingRequests.length,
        deliveries: readyOrders.length + inTransitOrders.length,
      },
      notifications,
    });
  } catch (err) {
    next(err);
  }
}

