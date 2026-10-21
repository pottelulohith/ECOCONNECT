import { User } from '../models/User.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { Complaint } from '../models/Complaint.js';
import { PurchaseRequest } from '../models/PurchaseRequest.js';
import { Order } from '../models/Order.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { ActivityLog } from '../models/ActivityLog.js';

/**
 * Purges all demo / mock records across all collections
 * and sets all dashboards to a clean state.
 */
export async function clearAllDemoData() {
  await Promise.all([
    Complaint.deleteMany({}),
    PickupRequest.deleteMany({}),
    CreditTransaction.deleteMany({}),
    PurchaseRequest.deleteMany({}),
    Order.deleteMany({}),
    ActivityLog.deleteMany({}),
    InventoryBatch.deleteMany({}),
    InventoryTransaction.deleteMany({}),
  ]);

  // Reset any pre-existing user wallet points to 0
  await User.updateMany({}, { $set: { walletPoints: 0 } });
  console.log('🧹 Purged all demo records (Complaints, Pickups, Credits, Orders, Deliveries, Inventory). All dashboards are clean.');
}

/**
 * Initializes essential user accounts for authentication
 * without inserting any dummy/demo records.
 */
export async function seedInitialData() {
  // Purge demo records first
  await clearAllDemoData();

  // Ensure default demo users exist for login authentication
  const defaultUsers = [
    {
      name: process.env.SEED_ADMIN_NAME || 'Officer R. Vance',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@ecoconnect.local',
      password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
      role: 'municipality',
      phone: '+91 11 2345 6789',
      ward: 'Central Command Hub',
      address: 'Civic Centre, Minto Road',
      walletPoints: 0,
    },
    {
      name: 'Arjun Mehta',
      email: 'citizen@ecoconnect.local',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 98102 34567',
      ward: 'Sector 14',
      address: 'Flat 402, Green Valley Apts, Sector 14',
      walletPoints: 0,
    },
    {
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
    },
  ];

  for (const userConfig of defaultUsers) {
    const existing = await User.findOne({ email: userConfig.email });
    if (!existing) {
      await User.create(userConfig);
    } else {
      existing.walletPoints = 0;
      await existing.save();
    }
  }

  console.log('✅ Core portal user accounts ready with 0 demo records.');
}
