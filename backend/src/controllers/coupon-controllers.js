import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { findCouponByCode } from '../db/coupon-repository.js';

const moduleName = 'coupon-controllers';

export const validateCouponRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'validateCouponRouteHandler: enter');
    const { code, subtotal } = getRequestPayload(req);
    logger.debug(moduleName, 'validateCouponRouteHandler: parsed body', { code, subtotal });
    if (!code) {
      logger.notice(moduleName, 'validateCouponRouteHandler: exit http=400', { reason: 'code_required' });
      return res.status(400).json({ status: 'failure', message: 'Coupon code required' });
    }
    logger.debug(moduleName, 'validateCouponRouteHandler: findCouponByCode');
    const c = await findCouponByCode(code);
    const now = new Date();
    if (!c || !c.active || (c.expiresAt && c.expiresAt <= now)) {
      logger.notice(moduleName, 'validateCouponRouteHandler: exit http=400', { reason: 'invalid_or_expired' });
      return res.status(400).json({ status: 'failure', message: 'Invalid or expired coupon' });
    }
    if (c.maxRedemptions != null && c.redemptions >= c.maxRedemptions) {
      logger.notice(moduleName, 'validateCouponRouteHandler: exit http=400', { reason: 'max_redemptions' });
      return res.status(400).json({ status: 'failure', message: 'Coupon no longer available' });
    }
    const base = Number(subtotal) || 0;
    let discount = 0;
    logger.debug(moduleName, 'validateCouponRouteHandler: compute discount', { discountType: c.discountType, base });
    if (c.discountType === 'percent') {
      discount = Math.round(base * (c.value / 100) * 100) / 100;
    } else {
      discount = Math.min(base, c.value);
    }
    logger.info(moduleName, 'validateCouponRouteHandler: exit http=200', { discount, code: c.code });
    return res.status(200).json({
      status: 'success',
      data: { code: c.code, discountType: c.discountType, value: c.value, discount },
    });
  } catch (err) {
    logger.error(moduleName, `validateCouponRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'validateCouponRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Coupon validation failed' });
  }
};
