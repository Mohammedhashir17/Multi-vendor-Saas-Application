import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import { authenticate } from '../middleware/auth-middleware.js';
import * as cart from '../controllers/cart-controllers.js';

const router = Router();
const moduleName = 'cart-routes';

router.get('/cart', authenticate, async (req, res, next) => {
  const routeId = 'GET /cart';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, role: req.auth?.role });
    logger.debug(moduleName, `${routeId}: call getCartRouteHandler`);
    await cart.getCartRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: getCartRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.put('/cart', authenticate, async (req, res, next) => {
  const routeId = 'PUT /cart';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, body: redactForLog(getRequestPayload(req)) });
    const { items } = getRequestPayload(req);
    logger.debug(moduleName, `${routeId}: call syncCartRouteHandler`, { itemCount: items?.length });
    await cart.syncCartRouteHandler(req, res, req.auth.userId, items);
    logger.info(moduleName, `${routeId}: syncCartRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
