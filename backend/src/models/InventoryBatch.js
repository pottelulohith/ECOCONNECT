import mongoose from 'mongoose';

const inventoryBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    polymerType: {
      type: String,
      required: true,
      enum: ['PET', 'HDPE', 'LDPE', 'PP'],
    },
    fullName: {
      type: String,
      default: '',
    },
    grade: {
      type: String,
      default: 'Grade A (Baled)',
    },
    currentStockKg: {
      type: Number,
      required: true,
      min: 0,
    },
    initialStockKg: {
      type: Number,
      required: true,
    },
    minPricePerKg: {
      type: Number,
      required: true,
    },
    processingCenter: {
      type: String,
      default: 'Sector 14 MRF Hub',
    },
    purityPercent: {
      type: Number,
      default: 98,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Reserved', 'Depleted'],
      default: 'In Stock',
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryBatch = mongoose.model('InventoryBatch', inventoryBatchSchema);
