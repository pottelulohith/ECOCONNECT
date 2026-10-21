import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryBatch',
      default: null,
    },
    polymerType: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Direct Intake", "Dispatch: DL-42", "Quality Audit", "Re-sorting Sort"
    },
    quantityKg: {
      type: Number,
      required: true,
    },
    previousStockKg: {
      type: Number,
      default: 0,
    },
    newStockKg: {
      type: Number,
      default: 0,
    },
    operator: {
      type: String,
      default: 'System / MRF Desk',
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
