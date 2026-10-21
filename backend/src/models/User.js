import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'municipality', 'industry'],
      default: 'citizen',
    },
    phone: {
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
    walletPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Industry specific fields
    companyName: {
      type: String,
      default: '',
    },
    industryType: {
      type: String,
      default: '',
    },
    businessCategory: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      default: '',
    },
    panNumber: {
      type: String,
      default: '',
    },
    facilityLocation: {
      type: String,
      default: '',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    monthlyCapacityKg: {
      type: Number,
      default: 10000,
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    polymers: {
      type: String,
      default: '',
    },
    // Municipality specific fields
    department: {
      type: String,
      default: 'Environmental & Sanitation Dept.',
    },
    zone: {
      type: String,
      default: 'Zone 4',
    },
    officeAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
