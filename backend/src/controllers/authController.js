import { User } from '../models/User.js';
import { sendTokenResponse } from '../utils/token.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, ward, address, companyName, industryType, gstNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
      phone: phone || '',
      ward: ward || 'Sector 14',
      address: address || '',
      companyName: companyName || '',
      industryType: industryType || '',
      gstNumber: gstNumber || '',
      walletPoints: role === 'citizen' ? 450 : 0,
    });

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Log in user
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Log out user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export async function logout(req, res) {
  const cookieName = process.env.COOKIE_NAME || 'ecocivic_session';
  res.cookie(cookieName, 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
}

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
export async function updateProfile(req, res, next) {
  try {
    const updates = {};
    const allowedFields = [
      'name',
      'phone',
      'ward',
      'address',
      'companyName',
      'industryType',
      'businessCategory',
      'gstNumber',
      'panNumber',
      'facilityLocation',
      'contactPerson',
      'designation',
      'monthlyCapacityKg',
      'city',
      'state',
      'pincode',
      'polymers',
      'department',
      'zone',
      'officeAddress',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.authorizedOfficer && !updates.name) updates.name = req.body.authorizedOfficer;
    if (req.body.authorizedPerson && !updates.contactPerson) updates.contactPerson = req.body.authorizedPerson;
    if (req.body.departmentName && !updates.department) updates.department = req.body.departmentName;
    if (req.body.facilityAddress && !updates.facilityLocation) updates.facilityLocation = req.body.facilityAddress;
    if (req.body.gstin && !updates.gstNumber) updates.gstNumber = req.body.gstin;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Quick demo login for seamless role testing
 * @route   POST /api/auth/demo-login
 * @access  Public
 */
export async function demoLogin(req, res, next) {
  try {
    let { role } = req.body; // 'citizen' | 'municipality' | 'industry'
    if (role === 'municipal') role = 'municipality';
    const targetRole = role || 'citizen';

    const roleEmails = {
      citizen: 'citizen@ecoconnect.local',
      municipality: 'admin@ecoconnect.local',
      municipal: 'admin@ecoconnect.local',
      industry: 'industry@ecoconnect.local',
    };

    const targetEmail = roleEmails[targetRole] || 'admin@ecoconnect.local';
    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.findOne({ role: targetRole });
    }

    if (!user) {
      // If seed hasn't run, create a default user
      const defaults = {
        citizen: {
          name: 'Arjun Mehta',
          email: 'citizen@ecoconnect.local',
          password: 'password123',
          role: 'citizen',
          phone: '+91 98102 34567',
          ward: 'Sector 14',
          address: 'Flat 402, Green Valley Apts, Sector 14',
          walletPoints: 0,
        },
        municipality: {
          name: 'Officer R. Vance',
          email: 'admin@ecoconnect.local',
          password: 'password123',
          role: 'municipality',
          phone: '+91 11 2345 6789',
          ward: 'Central Command',
          address: 'Civic Centre, Minto Road',
          walletPoints: 0,
        },
        industry: {
          name: 'Green Polymer Ind.',
          email: 'industry@ecoconnect.local',
          password: 'password123',
          role: 'industry',
          companyName: 'Green Polymer Industries Ltd.',
          industryType: 'Rigid Container Molding & Granulation',
          gstNumber: '07AABCU9603R1ZM',
          facilityLocation: 'Sector 18 Industrial Area, Warehouse 3',
          contactPerson: 'Siddharth Rao (Procurement Head)',
          phone: '+91 99887 66554',
          walletPoints: 0,
        },
      };

      defaults.municipal = defaults.municipality;

      try {
        user = await User.create(defaults[targetRole] || defaults.citizen);
      } catch (createErr) {
        if (createErr.code === 11000) {
          user = (await User.findOne({ email: targetEmail })) || (await User.findOne({ role: targetRole }));
        } else {
          throw createErr;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `Could not load ${targetRole} user account.` });
    }

    sendTokenResponse(user, 200, res, `Switched to ${targetRole} demo session`);
  } catch (err) {
    next(err);
  }
}
