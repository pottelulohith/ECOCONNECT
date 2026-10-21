import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { Complaint } from '../models/Complaint.js';
import { PurchaseRequest } from '../models/PurchaseRequest.js';
import { Order } from '../models/Order.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { ActivityLog } from '../models/ActivityLog.js';

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined. Exiting seed script.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.');

    // Clear existing data (optional / safe reset)
    console.log('🧹 Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      InventoryBatch.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      PickupRequest.deleteMany({}),
      Complaint.deleteMany({}),
      PurchaseRequest.deleteMany({}),
      Order.deleteMany({}),
      CreditTransaction.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    // 1. Seed Users
    console.log('👤 Seeding Users...');
    const adminUser = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Officer R. Vance',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@ecoconnect.local',
      password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
      role: 'municipality',
      phone: '+91 11 2345 6789',
      ward: 'Central Command Hub',
      address: 'Civic Centre, Minto Road',
      walletPoints: 0,
    });

    const citizenUser = await User.create({
      name: 'Arjun Mehta',
      email: 'citizen@ecoconnect.local',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 98102 34567',
      ward: 'Sector 14',
      address: 'Flat 402, Green Valley Apts, Sector 14',
      walletPoints: 450,
    });

    const industryUser = await User.create({
      name: 'Green Polymer Ind.',
      email: 'industry@ecoconnect.local',
      password: 'industry123',
      role: 'industry',
      companyName: 'Green Polymer Industries Ltd.',
      industryType: 'Rigid Container Molding & Granulation',
      gstNumber: '07AABCU9603R1ZM',
      facilityLocation: 'Sector 18 Industrial Area, Warehouse 3',
      contactPerson: 'Siddharth Rao (Procurement Head)',
      phone: '+91 99887 66554',
      walletPoints: 0,
    });

    console.log('✅ Users created:');
    console.log(`   - Municipality Admin: ${adminUser.email} (password: admin123)`);
    console.log(`   - Citizen:            ${citizenUser.email} (password: citizen123)`);
    console.log(`   - Industry:           ${industryUser.email} (password: industry123)`);

    // 2. Seed Inventory Batches
    console.log('📦 Seeding Inventory Batches...');
    const batches = await InventoryBatch.insertMany([
      {
        batchId: '#BATCH-PET-01',
        polymerType: 'PET',
        fullName: 'PET Clear Baled Flakes',
        grade: 'Grade A (Baled)',
        currentStockKg: 850,
        initialStockKg: 1000,
        minPricePerKg: 42,
        processingCenter: 'Sector 14 MRF Hub',
        purityPercent: 98,
        status: 'In Stock',
      },
      {
        batchId: '#BATCH-HDPE-02',
        polymerType: 'HDPE',
        fullName: 'HDPE Containers (Rigid)',
        grade: 'Grade A (Pellets)',
        currentStockKg: 420,
        initialStockKg: 500,
        minPricePerKg: 55,
        processingCenter: 'Sector 14 MRF Hub',
        purityPercent: 96,
        status: 'In Stock',
      },
      {
        batchId: '#BATCH-LDPE-03',
        polymerType: 'LDPE',
        fullName: 'LDPE Thin Film (Mixed)',
        grade: 'Grade B (Baled)',
        currentStockKg: 310,
        initialStockKg: 400,
        minPricePerKg: 35,
        processingCenter: 'Sector 14 MRF Hub',
        purityPercent: 92,
        status: 'In Stock',
      },
      {
        batchId: '#BATCH-PP-04',
        polymerType: 'PP',
        fullName: 'PP Rigid Caps & Crates',
        grade: 'Grade A (Crushed)',
        currentStockKg: 260,
        initialStockKg: 300,
        minPricePerKg: 48,
        processingCenter: 'Sector 14 MRF Hub',
        purityPercent: 95,
        status: 'In Stock',
      },
    ]);

    // 3. Seed Inventory Transactions
    console.log('📜 Seeding Inventory Audit Transactions...');
    await InventoryTransaction.insertMany([
      {
        transactionId: 'LOG-8812',
        batchId: batches[0]._id,
        polymerType: 'PET',
        action: 'Direct Intake (Citizen Verified)',
        quantityKg: 145,
        previousStockKg: 705,
        newStockKg: 850,
        operator: 'Officer R. Vance',
        timestamp: 'Today, 11:30 AM',
      },
      {
        transactionId: 'LOG-8811',
        batchId: batches[1]._id,
        polymerType: 'HDPE',
        action: 'Quality Grading & Granulation Complete',
        quantityKg: 50,
        previousStockKg: 370,
        newStockKg: 420,
        operator: 'MRF Lab Tech #3',
        timestamp: 'Today, 10:15 AM',
      },
      {
        transactionId: 'LOG-8809',
        batchId: batches[2]._id,
        polymerType: 'LDPE',
        action: 'Dispatched to Green Polymer Ind. (#ORD-4821)',
        quantityKg: -90,
        previousStockKg: 400,
        newStockKg: 310,
        operator: 'Logistics Desk',
        timestamp: 'Yesterday, 04:45 PM',
      },
    ]);

    // 4. Seed Pickups
    console.log('🚛 Seeding Pickups...');
    await PickupRequest.insertMany([
      {
        customId: '#REQ-8892',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        address: citizenUser.address,
        requestedDate: 'Oct 19, 2026',
        slot: '09:00 AM',
        pickupDate: 'Oct 20, 2026',
        status: 'completed',
        notes: '2 bags of cleaned PET soda bottles & milk jugs',
        verified: true,
        verifiedWeight: '4.2 kg',
        weightKg: 4.2,
        polymerType: 'PET Bottles',
        rewardOutcome: '+52 PTS',
        creditsAwarded: 52,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(),
      },
      {
        customId: '#REQ-8875',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        address: citizenUser.address,
        requestedDate: 'Oct 12, 2026',
        slot: '02:30 PM',
        pickupDate: 'Oct 13, 2026',
        status: 'completed',
        notes: 'Shampoo bottles and detergent jugs',
        verified: true,
        verifiedWeight: '6.8 kg',
        weightKg: 6.8,
        polymerType: 'HDPE Containers',
        rewardOutcome: '+85 PTS',
        creditsAwarded: 85,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(),
      },
      {
        customId: '#REQ-8840',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        address: citizenUser.address,
        requestedDate: 'Oct 04, 2026',
        slot: '11:00 AM',
        pickupDate: 'Oct 05, 2026',
        status: 'completed',
        notes: 'Amazon packaging bubble wrap and clear films',
        verified: true,
        verifiedWeight: '7.5 kg',
        weightKg: 7.5,
        polymerType: 'LDPE Films',
        rewardOutcome: '+95 PTS',
        creditsAwarded: 95,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(),
      },
      {
        customId: '#REQ-8901',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        address: citizenUser.address,
        requestedDate: 'Tomorrow, Oct 21',
        slot: '10:00 AM',
        pickupDate: 'Oct 21, 2026',
        status: 'scheduled',
        notes: 'Crushed mineral water bottles',
        verified: false,
        verifiedWeight: 'Pending',
        rewardOutcome: 'Est. ~45 PTS',
      },
    ]);

    // 5. Seed Citizen Credit Transactions
    console.log('💳 Seeding Credit Transactions...');
    await CreditTransaction.insertMany([
      {
        transactionId: 'TXN-9011',
        citizenId: citizenUser._id,
        amount: 52,
        type: 'pickup_reward',
        description: 'Verified 4.2 kg PET Bottles (#REQ-8892)',
        balanceAfter: 450,
      },
      {
        transactionId: 'TXN-8980',
        citizenId: citizenUser._id,
        amount: 85,
        type: 'pickup_reward',
        description: 'Verified 6.8 kg HDPE Containers (#REQ-8875)',
        balanceAfter: 398,
      },
      {
        transactionId: 'TXN-8920',
        citizenId: citizenUser._id,
        amount: -100,
        type: 'voucher_redemption',
        description: 'Redeemed ₹50 Metro Travel Voucher (Code: ECO-METRO-492)',
        balanceAfter: 313,
      },
    ]);

    // 6. Seed Complaints
    console.log('🚨 Seeding Civic Complaints...');
    await Complaint.insertMany([
      {
        customId: '#CIV-8921',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        title: 'Overflowing Plastic Bin near Market Gate 3',
        category: 'Overflowing Bin',
        location: 'Sector 14 Main Commercial Complex, Gate 3',
        description: 'Community recycling bin is overflowing onto pedestrian walkway. Plastic bottles spilling out.',
        status: 'Assigned',
        priority: 'High',
        assignedTeam: 'Rapid Sanitation Team 04',
        timeline: [
          { step: 'Report Submitted', date: 'Oct 19, 2026', time: '08:30 AM', status: 'completed' },
          { step: 'Team Assigned (Rapid Sanitation Team 04)', date: 'Oct 19, 2026', time: '10:15 AM', status: 'completed' },
          { step: 'Site Inspection', date: 'In Progress', time: '', status: 'current' },
          { step: 'Issue Resolved', date: 'Target: 24h', time: '', status: 'upcoming' },
        ],
      },
      {
        customId: '#CIV-8910',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        title: 'Illegal Plastic Dumping in Community Park Corner',
        category: 'Illegal Dumping',
        location: 'Pocket B Green Park, near Jogging Track',
        description: 'Construction and plastic packaging dumped overnight.',
        status: 'Submitted',
        priority: 'Medium',
        assignedTeam: null,
        timeline: [
          { step: 'Report Submitted', date: 'Oct 20, 2026', time: '07:45 AM', status: 'completed' },
          { step: 'Team Assigned', date: 'Pending Allocation', time: '', status: 'upcoming' },
          { step: 'Site Inspection', date: 'Scheduled', time: '', status: 'upcoming' },
          { step: 'Issue Resolved', date: 'Target: 24h', time: '', status: 'upcoming' },
        ],
      },
      {
        customId: '#CIV-8842',
        citizenId: citizenUser._id,
        citizenName: citizenUser.name,
        citizenPhone: citizenUser.phone,
        ward: citizenUser.ward,
        title: 'Open Plastic Waste Burning behind Substation',
        category: 'Burning Waste',
        location: 'Sector 14 Power Substation Rear Alley',
        description: 'Toxic black smoke from burning dry plastic debris.',
        status: 'Resolved',
        priority: 'Critical',
        assignedTeam: 'Emergency Response Squad Alpha',
        resolutionNotes: 'Fire extinguished and area cleared with warning issued.',
        timeline: [
          { step: 'Report Submitted', date: 'Oct 17, 2026', time: '02:00 PM', status: 'completed' },
          { step: 'Team Assigned (Emergency Squad Alpha)', date: 'Oct 17, 2026', time: '02:15 PM', status: 'completed' },
          { step: 'Site Cleared & Doused', date: 'Oct 17, 2026', time: '03:30 PM', status: 'completed' },
          { step: 'Issue Resolved', date: 'Oct 17, 2026', time: '04:00 PM', status: 'completed' },
        ],
      },
    ]);

    // 7. Seed Purchase Requests
    console.log('🏭 Seeding Industry Purchase Requests...');
    const purchaseReqs = await PurchaseRequest.insertMany([
      {
        customId: '#ORD-4821',
        industryId: industryUser._id,
        companyName: industryUser.companyName,
        buyerGst: industryUser.gstNumber,
        polymerType: 'PET',
        quantityKg: 1200,
        ratePerKg: 42,
        totalAmount: 50400,
        deliveryAddress: 'Unit 4, Industrial Area Phase 2',
        requestedDelivery: 'Immediate (Within 48h)',
        paymentStatus: 'Escrow Funded',
        status: 'Approved',
        approvedBy: adminUser._id,
        reviewedAt: new Date(),
      },
      {
        customId: '#ORD-4818',
        industryId: industryUser._id,
        companyName: industryUser.companyName,
        buyerGst: industryUser.gstNumber,
        polymerType: 'HDPE',
        quantityKg: 800,
        ratePerKg: 55,
        totalAmount: 44000,
        deliveryAddress: 'Unit 4, Industrial Area Phase 2',
        requestedDelivery: 'Within 3 Days',
        paymentStatus: 'Escrow Funded',
        status: 'Pending Review',
      },
      {
        customId: '#ORD-4810',
        industryId: industryUser._id,
        companyName: industryUser.companyName,
        buyerGst: industryUser.gstNumber,
        polymerType: 'PP',
        quantityKg: 500,
        ratePerKg: 48,
        totalAmount: 24000,
        deliveryAddress: 'Unit 4, Industrial Area Phase 2',
        requestedDelivery: 'Scheduled End of Month',
        paymentStatus: 'Pending Escrow',
        status: 'Pending Review',
      },
    ]);

    // 8. Seed Orders / Deliveries
    console.log('🚚 Seeding Shipments & Live Tracking...');
    await Order.insertMany([
      {
        orderId: '#DEL-9042',
        purchaseRequestId: purchaseReqs[0]._id,
        industryId: industryUser._id,
        polymer: 'PET Baled Clear (Grade A)',
        quantityKg: 1200,
        totalAmount: 50400,
        status: 'In Transit',
        eta: 'Today, 04:30 PM',
        destination: 'Unit 4, Industrial Area Phase 2',
        vehicleNo: 'DL-01-AB-4921',
        driverName: 'Suresh Kumar',
        driverPhone: '+91 98765 43210',
        currentLocation: 'Ring Road Flyover Junction (28.6139° N, 77.2090° E)',
        coords: { lat: 28.6139, lng: 77.209 },
        milestones: [
          { step: 'Order Placed & Escrow Funded', time: 'Oct 18, 10:00 AM', completed: true, current: false },
          { step: 'Bales Weighed & Quality Tagged', time: 'Oct 19, 08:30 AM', completed: true, current: false },
          { step: 'Loaded on Vehicle DL-01-AB-4921', time: 'Oct 19, 11:45 AM', completed: true, current: false },
          { step: 'In Transit to Destination', time: 'Oct 19, 01:20 PM', completed: true, current: true },
          { step: 'Gate Inward & Final Inspection', time: 'Est. 04:30 PM', completed: false, current: false },
        ],
      },
      {
        orderId: '#DEL-8871',
        industryId: industryUser._id,
        polymer: 'HDPE Granules / Flakes (Mixed)',
        quantityKg: 2000,
        totalAmount: 110000,
        status: 'Delivered',
        eta: 'Delivered Oct 16',
        destination: 'Main Processing Unit 1, Okhla',
        vehicleNo: 'HR-26-CV-8821',
        driverName: 'Vikram Singh',
        driverPhone: '+91 98111 22334',
        currentLocation: 'Delivered at Unloading Dock 2',
        coords: { lat: 28.5355, lng: 77.2732 },
        milestones: [
          { step: 'Order Placed & Escrow Funded', time: 'Oct 14, 09:15 AM', completed: true, current: false },
          { step: 'Bales Weighed & Quality Tagged', time: 'Oct 15, 10:00 AM', completed: true, current: false },
          { step: 'Dispatched from Hub', time: 'Oct 15, 02:00 PM', completed: true, current: false },
          { step: 'Gate Inward & Final Inspection', time: 'Oct 16, 11:20 AM', completed: true, current: false },
        ],
      },
    ]);

    // 9. Seed Activity Logs
    console.log('📝 Seeding Activity Logs...');
    await ActivityLog.insertMany([
      {
        logId: 'ACT-1001',
        action: 'Pickup Verified',
        portal: 'municipality',
        actorName: 'Officer R. Vance',
        description: 'Verified 4.2 kg PET Bottles for Arjun Mehta. +52 PTS awarded.',
        timestamp: '11:32 AM',
      },
      {
        logId: 'ACT-1002',
        action: 'Team Assigned',
        portal: 'municipality',
        actorName: 'Officer R. Vance',
        description: 'Assigned Rapid Sanitation Team 04 to #CIV-8921 (Market Gate 3).',
        timestamp: '10:18 AM',
      },
      {
        logId: 'ACT-1003',
        action: 'Order Approved',
        portal: 'municipality',
        actorName: 'Officer R. Vance',
        description: 'Approved order #ORD-4821 for Green Polymer Ind. (1,200 kg PET). Delivery scheduled.',
        timestamp: '09:40 AM',
      },
      {
        logId: 'ACT-1004',
        action: 'Issue Reported',
        portal: 'citizen',
        actorName: 'Arjun Mehta',
        description: 'New complaint reported: "Overflowing Plastic Bin near Market Gate 3".',
        timestamp: '08:30 AM',
      },
    ]);

    console.log('🎉 Seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
