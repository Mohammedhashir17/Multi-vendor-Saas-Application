import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import { authenticate } from '../middleware/auth-middleware.js';
import * as review from '../controllers/review-controllers.js';

const router = Router();
const moduleName = 'review-routes';

router.get('/products/:productId/reviews', async (req, res, next) => {
  const routeId = 'GET /products/:productId/reviews';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { productId: req.params.productId });
    logger.debug(moduleName, `${routeId}: call listProductReviewsRouteHandler`);
    await review.listProductReviewsRouteHandler(req, res, req.params.productId);
    logger.info(moduleName, `${routeId}: listProductReviewsRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.post('/reviews', authenticate, async (req, res, next) => {
  const routeId = 'POST /reviews';
  try {
    logger.debug(moduleName, `${routeId}: enter`, {
      userId: req.auth?.userId,
      body: redactForLog(getRequestPayload(req)),
    });
    logger.debug(moduleName, `${routeId}: call createReviewRouteHandler`);
    await review.createReviewRouteHandler(req, res, req.auth.userId);
    logger.info(moduleName, `${routeId}: createReviewRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
