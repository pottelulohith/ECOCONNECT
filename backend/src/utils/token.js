import jwt from 'jsonwebtoken';

export function generateToken(id) {
  const secret = process.env.JWT_SECRET || 'ecoconnect_default_secret_key_2026_dev_mode_only';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
}

export function sendTokenResponse(user, statusCode, res, message = 'Success') {
  const token = generateToken(user._id);

  const cookieName = process.env.COOKIE_NAME || 'ecocivic_session';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    ward: user.ward || 'Sector 14',
    address: user.address || '',
    walletPoints: user.walletPoints ?? 0,
    companyName: user.companyName || '',
    industryType: user.industryType || '',
    gstNumber: user.gstNumber || '',
    facilityLocation: user.facilityLocation || '',
    contactPerson: user.contactPerson || '',
  };

  res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: userSafe,
    });
}
