import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Attaches req.user when a valid Bearer token is present.
 *
 * The app runs in single-user "demo" mode by default: if there is no token we do
 * NOT reject the request — we simply scope it to user = null. This makes the API
 * usable out of the box while keeping the door open for full JWT auth.
 */
export async function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).lean();
    } catch {
      req.user = null;
    }
  }
  // userId is what controllers scope queries by.
  req.userId = req.user ? req.user._id : null;
  next();
}

// Use on routes that must have a real authenticated user.
export function requireAuth(req, res, next) {
  if (!req.user) {
    res.status(401);
    return next(new Error('Not authorized — please log in'));
  }
  next();
}
