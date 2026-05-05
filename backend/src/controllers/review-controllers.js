import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { createReview, listReviewsForProduct, findReviewByUserProduct } from '../db/review-repository.js';
import { findProductById } from '../db/product-repository.js';
import { findOrderById } from '../db/order-repository.js';

const moduleName = 'review-controllers';

export const createReviewRouteHandler = async (req, res, userId) => {
  try {
    logger.debug(moduleName, 'createReviewRouteHandler: enter', { userId });
    const { productId, orderId, rating, text } = getRequestPayload(req);
    logger.debug(moduleName, 'createReviewRouteHandler: parsed body', { productId, orderId, rating, hasText: !!text });
    if (!productId || !rating) {
      logger.notice(moduleName, 'createReviewRouteHandler: exit http=400', { reason: 'productId_rating_required' });
      return res.status(400).json({ status: 'failure', message: 'productId and rating are required' });
    }
    logger.debug(moduleName, 'createReviewRouteHandler: findProductById');
    const p = await findProductById(productId);
    if (!p) {
      logger.notice(moduleName, 'createReviewRouteHandler: exit http=404', { reason: 'product_not_found' });
      return res.status(404).json({ status: 'failure', message: 'Product not found' });
    }

    logger.debug(moduleName, 'createReviewRouteHandler: findReviewByUserProduct');
    const existing = await findReviewByUserProduct(userId, productId);
    if (existing) {
      logger.notice(moduleName, 'createReviewRouteHandler: exit http=409', { reason: 'already_reviewed' });
      return res.status(409).json({ status: 'failure', message: 'You already reviewed this product' });
    }

    if (orderId) {
      logger.debug(moduleName, 'createReviewRouteHandler: validate order purchase');
      const order = await findOrderById(orderId);
      const custId = order?.customerId?._id?.toString() || order?.customerId?.toString();
      if (!order || custId !== userId) {
        logger.notice(moduleName, 'createReviewRouteHandler: exit http=400', { reason: 'invalid_order' });
        return res.status(400).json({ status: 'failure', message: 'Invalid order for review' });
      }
      const bought = order.items.some((i) => {
        const productRef = i.productId?._id ?? i.productId;
        return productRef && productRef.toString() === productId.toString();
      });
      if (!bought) {
        logger.notice(moduleName, 'createReviewRouteHandler: exit http=400', { reason: 'product_not_in_order' });
        return res.status(400).json({ status: 'failure', message: 'Product not in this order' });
      }
    }

    logger.debug(moduleName, 'createReviewRouteHandler: createReview');
    const rev = await createReview({
      productId,
      userId,
      orderId: orderId || undefined,
      rating: Number(rating),
      text: text || '',
    });

    logger.info(moduleName, 'createReviewRouteHandler: exit http=201', { reviewId: rev?._id?.toString() });
    return res.status(201).json({ status: 'success', data: { review: rev } });
  } catch (err) {
    logger.error(moduleName, `createReviewRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'createReviewRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to save review' });
  }
};

export const listProductReviewsRouteHandler = async (req, res, productId) => {
  try {
    logger.debug(moduleName, 'listProductReviewsRouteHandler: enter', { productId });
    logger.debug(moduleName, 'listProductReviewsRouteHandler: listReviewsForProduct');
    const reviews = await listReviewsForProduct(productId);
    logger.info(moduleName, 'listProductReviewsRouteHandler: exit http=200', { count: reviews?.length });
    return res.status(200).json({ status: 'success', data: { reviews } });
  } catch (err) {
    logger.error(moduleName, `listProductReviewsRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listProductReviewsRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to load reviews' });
  }
};
