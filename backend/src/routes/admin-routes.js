import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import { authenticate, requireRoles } from '../middleware/auth-middleware.js';
import * as admin from '../controllers/admin-controllers.js';

const router = Router();
const moduleName = 'admin-routes';

router.get('/admin/shops', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'GET /admin/shops';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, query: req.query });
    logger.debug(moduleName, `${routeId}: call listShopsAdminRouteHandler`);
    await admin.listShopsAdminRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: listShopsAdminRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.patch('/admin/shops/:id', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'PATCH /admin/shops/:id';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      shopId: req.params.id,
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call updateShopStatusRouteHandler`);
    await admin.updateShopStatusRouteHandler(req, res, req.params.id);
    logger.info(moduleName, `${routeId}: updateShopStatusRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/admin/products/pending', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'GET /admin/products/pending';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId });
    logger.debug(moduleName, `${routeId}: call listPendingProductsAdminRouteHandler`);
    await admin.listPendingProductsAdminRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: listPendingProductsAdminRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.patch('/admin/products/:id/moderation', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'PATCH /admin/products/:id/moderation';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      productId: req.params.id,
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call moderateProductRouteHandler`);
    await admin.moderateProductRouteHandler(req, res, req.params.id);
    logger.info(moduleName, `${routeId}: moderateProductRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/admin/coupons', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'GET /admin/coupons';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId });
    logger.debug(moduleName, `${routeId}: call listCouponsAdminRouteHandler`);
    await admin.listCouponsAdminRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: listCouponsAdminRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.post('/admin/coupons', authenticate, requireRoles('admin'), async (req, res, next) => {
  const routeId = 'POST /admin/coupons';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, body: redactForLog(getRequestPayload(req)) });
    logger.debug(moduleName, `${routeId}: call createCouponAdminRouteHandler`);
    await admin.createCouponAdminRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: createCouponAdminRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
