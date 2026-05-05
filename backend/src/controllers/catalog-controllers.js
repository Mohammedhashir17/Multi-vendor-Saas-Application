import * as logger from '../common/logger.js';
import { CATEGORIES, toPublicProduct } from '../common/shared.js';
import { listProducts, findProductById, findProductBySlug } from '../db/product-repository.js';
import mongoose from 'mongoose';

const moduleName = 'catalog-controllers';

export const listProductsRouteHandler = async (req, res, query) => {
  try {
    logger.debug(moduleName, 'listProductsRouteHandler: enter', { query });
    logger.debug(moduleName, 'listProductsRouteHandler: listProducts');
    const { items, total, page, limit } = await listProducts(query);
    logger.debug(moduleName, 'listProductsRouteHandler: map toPublicProduct', { count: items?.length, total });
    logger.info(moduleName, 'listProductsRouteHandler: exit http=200', { total, page, limit });
    return res.status(200).json({
      status: 'success',
      data: { products: items.map(toPublicProduct), total, page, limit },
    });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `listProductsRouteHandler: ${errorMessage}`);
    logger.debug(moduleName, 'listProductsRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list products' });
  }
};

export const getProductRouteHandler = async (req, res, idOrSlug) => {
  try {
    logger.debug(moduleName, 'getProductRouteHandler: enter', { idOrSlug });
    let p = null;
    if (mongoose.isValidObjectId(idOrSlug)) {
      logger.debug(moduleName, 'getProductRouteHandler: findProductById');
      p = await findProductById(idOrSlug);
    }
    if (!p) {
      logger.debug(moduleName, 'getProductRouteHandler: findProductBySlug');
      p = await findProductBySlug(idOrSlug);
    }
    if (!p || !p.shopId || p.shopId.status !== 'approved' || !p.active || p.moderationStatus !== 'approved') {
      logger.notice(moduleName, 'getProductRouteHandler: exit http=404', { reason: 'not_found_or_not_listable' });
      return res.status(404).json({ status: 'failure', message: 'Product not found' });
    }
    logger.info(moduleName, 'getProductRouteHandler: exit http=200', { productId: p._id?.toString() });
    return res.status(200).json({ status: 'success', data: { product: toPublicProduct(p) } });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `getProductRouteHandler: ${errorMessage}`);
    logger.debug(moduleName, 'getProductRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to load product' });
  }
};

export const getCategoriesRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'getCategoriesRouteHandler: enter');
    logger.debug(moduleName, 'getCategoriesRouteHandler: return CATEGORIES static list', { count: CATEGORIES.length });
    logger.info(moduleName, 'getCategoriesRouteHandler: exit http=200');
    return res.status(200).json({ status: 'success', data: { categories: CATEGORIES } });
  } catch (err) {
    logger.error(moduleName, `getCategoriesRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'getCategoriesRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list categories' });
  }
};
