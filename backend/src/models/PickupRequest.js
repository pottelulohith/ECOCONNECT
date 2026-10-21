import mongoose from 'mongoose';

const pickupRequestSchema = new mongoose.Schema(
  {
    customId: {
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
    citizenName: {
      type: String,
      required: true,
    },
    citizenPhone: {
      type: String,
      default: '',
    },
    ward: {
      type: String,
      default: 'Sector 14',
    },
    address: {
      type: String,
      default: '',
    },
    requestedDate: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      default: '',
    },
    pickupDate: {
      type: String,
      default: null, // assigned by municipality upon scheduling/verification
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedWeight: {
      type: String,
      default: 'Pending',
    },
    weightKg: {
      type: Number,
      default: 0,
    },
    polymerType: {
      type: String,
      default: null,
    },
    rewardOutcome: {
      type: String,
      default: 'Pending Verification',
    },
    creditsAwarded: {
      type: Number,
      default: 0,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
