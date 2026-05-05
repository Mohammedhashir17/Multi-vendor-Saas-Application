import jwt from 'jsonwebtoken';
import * as logger from '../common/logger.js';

const moduleName = 'auth-middleware';

export function authenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'failure', message: 'Authentication required' });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    const payload = jwt.verify(h.slice(7), secret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'customer',
    };
    next();
  } catch (e) {
    logger.debug(moduleName, 'authenticate: invalid token', e.message);
    return res.status(401).json({ status: 'failure', message: 'Invalid or expired token' });
  }
}

export function optionalAuthenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next();
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next();
    const payload = jwt.verify(h.slice(7), secret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'customer',
    };
  } catch {
    /* ignore */
  }
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ status: 'failure', message: 'Authentication required' });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ status: 'failure', message: 'Forbidden' });
    }
    next();
  };
}

export async function requireVendorCanSell(req, res, next) {
  try {
    const { findUserById } = await import('../db/user-repository.js');
    const { findShopByVendor } = await import('../db/shop-repository.js');
    const { isVendorEntitled } = await import('../common/shared.js');

    const user = await findUserById(req.auth.userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ status: 'failure', message: 'Vendor account required' });
    }
    const shop = await findShopByVendor(user._id);
    if (!shop) {
      return res.status(403).json({ status: 'failure', message: 'Create your shop first' });
    }
    if (shop.status !== 'approved') {
      return res.status(403).json({
        status: 'failure',
        message: 'Shop must be approved by admin before you can sell',
        data: { shopStatus: shop.status },
      });
    }
    if (!isVendorEntitled(user)) {
      return res.status(403).json({
        status: 'failure',
        message: 'Trial expired or subscription inactive — purchase a plan to continue',
      });
    }
    req.vendor = { user, shop };
    next();
  } catch (e) {
    next(e);
  }
}
