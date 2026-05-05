import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { authenticate, requireRoles } from '../middleware/auth-middleware.js';
import {
  createOrderRouteHandler,
  listOrdersRouteHandler,
  getOrderRouteHandler,
  updateOrderStatusRouteHandler,
} from '../controllers/order-controllers.js';

const router = Router();
const moduleName = 'order-routes';

router.post('/orders', authenticate, async (req, res, next) => {
  const routeId = 'POST /orders';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, role: req.auth?.role });
    const payload = getRequestPayload(req);
    logger.debug(moduleName, `${routeId}: check role`, { role: req.auth.role });
    if (req.auth.role === 'admin') {
      logger.notice(moduleName, `${routeId}: exit http=403`, { reason: 'admin_cannot_place_order' });
      return res.status(403).json({ status: 'failure', message: 'Admins cannot place marketplace orders' });
    }
    logger.debug(moduleName, `${routeId}: call createOrderRouteHandler`, { hasItems: !!payload?.items?.length, hasAddress: !!payload?.address });
    await createOrderRouteHandler(req, res, req.auth.userId, payload);
    logger.info(moduleName, `${routeId}: createOrderRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/orders', authenticate, async (req, res, next) => {
  const routeId = 'GET /orders';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, role: req.auth?.role });
    logger.debug(moduleName, `${routeId}: call listOrdersRouteHandler`);
    await listOrdersRouteHandler(req, res, req.auth);
    logger.info(moduleName, `${routeId}: listOrdersRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/orders/:id', authenticate, async (req, res, next) => {
  const routeId = 'GET /orders/:id';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { orderId: req.params.id, userId: req.auth?.userId, role: req.auth?.role });
    logger.debug(moduleName, `${routeId}: call getOrderRouteHandler`);
    await getOrderRouteHandler(req, res, req.auth, req.params.id);
    logger.info(moduleName, `${routeId}: getOrderRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.patch('/orders/:id/status', authenticate, requireRoles('vendor', 'admin'), async (req, res, next) => {
  const routeId = 'PATCH /orders/:id/status';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { orderId: req.params.id, userId: req.auth?.userId, role: req.auth?.role });
    const { status: nextStatus } = getRequestPayload(req);
    logger.debug(moduleName, `${routeId}: validate status body`, { nextStatus });
    if (!nextStatus) {
      logger.notice(moduleName, `${routeId}: exit http=400`, { reason: 'status_required' });
      return res.status(400).json({ status: 'failure', message: 'status is required' });
    }
    logger.debug(moduleName, `${routeId}: call updateOrderStatusRouteHandler`);
    await updateOrderStatusRouteHandler(req, res, req.auth, req.params.id, nextStatus);
    logger.info(moduleName, `${routeId}: updateOrderStatusRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
