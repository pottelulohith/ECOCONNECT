import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['pickup_reward', 'voucher_redemption', 'bonus', 'adjustment'],
      default: 'pickup_reward',
    },
    description: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
