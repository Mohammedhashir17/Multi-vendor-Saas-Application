import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import { authenticate, requireRoles, requireVendorCanSell } from '../middleware/auth-middleware.js';
import * as vendor from '../controllers/vendor-controllers.js';

const router = Router();
const moduleName = 'vendor-routes';

router.get('/vendor/shop', authenticate, requireRoles('vendor'), async (req, res, next) => {
  const routeId = 'GET /vendor/shop';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId });
    logger.debug(moduleName, `${routeId}: call getMyShopRouteHandler`);
    await vendor.getMyShopRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: getMyShopRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.post('/vendor/shop', authenticate, requireRoles('vendor'), async (req, res, next) => {
  const routeId = 'POST /vendor/shop';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, body: redactForLog(getRequestPayload(req)) });
    logger.debug(moduleName, `${routeId}: call createShopRouteHandler`);
    await vendor.createShopRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: createShopRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.patch('/vendor/shop', authenticate, requireRoles('vendor'), async (req, res, next) => {
  const routeId = 'PATCH /vendor/shop';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId, body: redactForLog(getRequestPayload(req)) });
    logger.debug(moduleName, `${routeId}: call updateShopRouteHandler`);
    await vendor.updateShopRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: updateShopRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/vendor/products', authenticate, requireRoles('vendor'), async (req, res, next) => {
  const routeId = 'GET /vendor/products';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { userId: req.auth?.userId });
    logger.debug(moduleName, `${routeId}: call listMyProductsRouteHandler`);
    await vendor.listMyProductsRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: listMyProductsRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.post('/vendor/products', authenticate, requireRoles('vendor'), requireVendorCanSell, async (req, res, next) => {
  const routeId = 'POST /vendor/products';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      shopId: req.vendor?.shop?._id?.toString(),
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call createProductRouteHandler`);
    await vendor.createProductRouteHandler(req, res, req.auth.userId, req.vendor.shop);
    logger.info(moduleName, `${routeId}: createProductRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.patch('/vendor/products/:id', authenticate, requireRoles('vendor'), requireVendorCanSell, async (req, res, next) => {
  const routeId = 'PATCH /vendor/products/:id';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      productId: req.params.id,
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call updateProductRouteHandler`);
    await vendor.updateProductRouteHandler(req, res, req.auth.userId, req.params.id);
    logger.info(moduleName, `${routeId}: updateProductRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
