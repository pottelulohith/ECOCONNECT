import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    industryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    buyerGst: {
      type: String,
      default: '',
    },
    polymerType: {
      type: String,
      required: true,
      enum: ['PET', 'HDPE', 'LDPE', 'PP'],
    },
    quantityKg: {
      type: Number,
      required: true,
      min: 1,
    },
    ratePerKg: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    requestedDelivery: {
      type: String,
      default: 'Immediate (Within 48h)',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    paymentTerms: {
      type: String,
      default: 'Net 15 Days',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending Escrow', 'Escrow Funded', 'Settled', 'Refunded'],
      default: 'Escrow Funded',
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected', 'Fulfilled', 'Delivered'],
      default: 'Pending Review',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);
