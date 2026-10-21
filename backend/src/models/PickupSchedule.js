import mongoose from 'mongoose';

const pickupScheduleSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['ward', 'citizen'],
      default: 'ward',
      required: true,
    },
    ward: {
      type: String,
      trim: true,
      default: '',
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    citizenName: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: String, // Stored in DD-MM-YYYY format
      required: [true, 'Please provide a scheduled date'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and uniqueness per target
pickupScheduleSchema.index({ targetType: 1, ward: 1 });
pickupScheduleSchema.index({ targetType: 1, citizenId: 1 });

export const PickupSchedule = mongoose.model('PickupSchedule', pickupScheduleSchema);
