import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import * as coupon from '../controllers/coupon-controllers.js';

const router = Router();
const moduleName = 'coupon-routes';

router.post('/coupons/validate', async (req, res, next) => {
  const routeId = 'POST /coupons/validate';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path, body: redactForLog(getRequestPayload(req)) });
    logger.debug(moduleName, `${routeId}: call validateCouponRouteHandler`);
    await coupon.validateCouponRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: validateCouponRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
