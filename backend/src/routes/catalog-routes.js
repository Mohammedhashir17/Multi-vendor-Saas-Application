import { Router } from 'express';
import * as logger from '../common/logger.js';
import * as catalog from '../controllers/catalog-controllers.js';

const router = Router();
const moduleName = 'catalog-routes';

router.get('/products', async (req, res, next) => {
  const routeId = 'GET /products';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { query: req.query });
    const { category, q, shopId, page, limit } = req.query;
    const query = { category, q, shopId, page: Number(page), limit: Number(limit) };
    logger.debug(moduleName, `${routeId}: call listProductsRouteHandler`, query);
    await catalog.listProductsRouteHandler(req, res, query);
    logger.info(moduleName, `${routeId}: listProductsRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/products/search', async (req, res, next) => {
  const routeId = 'GET /products/search';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { query: req.query });
    const { q, category, shopId, page, limit } = req.query;
    const query = { category, q, shopId, page: Number(page), limit: Number(limit) };
    logger.debug(moduleName, `${routeId}: call listProductsRouteHandler`, query);
    await catalog.listProductsRouteHandler(req, res, query);
    logger.info(moduleName, `${routeId}: listProductsRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/products/:id', async (req, res, next) => {
  const routeId = 'GET /products/:id';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { params: req.params });
    logger.debug(moduleName, `${routeId}: call getProductRouteHandler`, { id: req.params.id });
    await catalog.getProductRouteHandler(req, res, req.params.id);
    logger.info(moduleName, `${routeId}: getProductRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  const routeId = 'GET /categories';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path });
    logger.debug(moduleName, `${routeId}: call getCategoriesRouteHandler`);
    await catalog.getCategoriesRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: getCategoriesRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
