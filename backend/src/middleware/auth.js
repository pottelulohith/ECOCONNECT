import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  let token = null;

  const cookieName = process.env.COOKIE_NAME || 'ecocivic_session';

  if (req.cookies && req.cookies[cookieName]) {
    token = req.cookies[cookieName];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'ecoconnect_default_secret_key_2026_dev_mode_only';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
      error: err.message,
    });
  }
}

export function requireRole(...roles) {
  const normalizedRoles = roles.flatMap((r) =>
    r === 'municipality' || r === 'municipal' ? ['municipality', 'municipal'] : [r]
  );
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role === 'municipal' ? 'municipality' : req.user.role;
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this endpoint`,
      });
    }

    next();
  };
}
