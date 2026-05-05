import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import { authenticate } from '../middleware/auth-middleware.js';
import * as payment from '../controllers/payment-controllers.js';

const router = Router();
const moduleName = 'payment-routes';

router.post('/payments/dummy', authenticate, async (req, res, next) => {
  const routeId = 'POST /payments/dummy';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call processDummyPaymentRouteHandler`);
    await payment.processDummyPaymentRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: processDummyPaymentRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
