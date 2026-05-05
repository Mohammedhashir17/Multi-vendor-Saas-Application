import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { findShopById, saveShop } from '../db/shop-repository.js';
import { listPendingProducts } from '../db/product-repository.js';
import { createCoupon, listCoupons } from '../db/coupon-repository.js';
import { ShopModel } from '../db/shop.model.js';
import { ProductModel } from '../db/product.model.js';

const moduleName = 'admin-controllers';

export const listShopsAdminRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'listShopsAdminRouteHandler: enter', { query: req.query });
    const { status } = req.query;
    const filter = status ? { status: String(status) } : {};
    logger.debug(moduleName, 'listShopsAdminRouteHandler: ShopModel.find', { filter });
    const shops = await ShopModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    logger.info(moduleName, 'listShopsAdminRouteHandler: exit http=200', { count: shops?.length });
    return res.status(200).json({ status: 'success', data: { shops } });
  } catch (err) {
    logger.error(moduleName, `listShopsAdminRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listShopsAdminRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list shops' });
  }
};

export const updateShopStatusRouteHandler = async (req, res, shopId) => {
  try {
    logger.debug(moduleName, 'updateShopStatusRouteHandler: enter', { shopId });
    const { status, rejectionReason } = getRequestPayload(req);
    logger.debug(moduleName, 'updateShopStatusRouteHandler: payload', { status, hasReason: !!rejectionReason });
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      logger.notice(moduleName, 'updateShopStatusRouteHandler: exit http=400', { reason: 'invalid_status' });
      return res.status(400).json({ status: 'failure', message: 'Invalid status' });
    }
    logger.debug(moduleName, 'updateShopStatusRouteHandler: findShopById');
    const shop = await findShopById(shopId);
    if (!shop) {
      logger.notice(moduleName, 'updateShopStatusRouteHandler: exit http=404', { reason: 'not_found' });
      return res.status(404).json({ status: 'failure', message: 'Shop not found' });
    }
    shop.status = status;
    if (status === 'rejected' && rejectionReason) shop.rejectionReason = String(rejectionReason);
    if (status === 'approved') shop.rejectionReason = '';
    logger.debug(moduleName, 'updateShopStatusRouteHandler: saveShop');
    await saveShop(shop);
    logger.info(moduleName, 'updateShopStatusRouteHandler: exit http=200', { shopId: shop._id?.toString(), status });
    return res.status(200).json({ status: 'success', data: { shop } });
  } catch (err) {
    logger.error(moduleName, `updateShopStatusRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'updateShopStatusRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to update shop' });
  }
};

export const listPendingProductsAdminRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'listPendingProductsAdminRouteHandler: enter');
    logger.debug(moduleName, 'listPendingProductsAdminRouteHandler: listPendingProducts');
    const products = await listPendingProducts();
    logger.info(moduleName, 'listPendingProductsAdminRouteHandler: exit http=200', { count: products?.length });
    return res.status(200).json({ status: 'success', data: { products } });
  } catch (err) {
    logger.error(moduleName, `listPendingProductsAdminRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listPendingProductsAdminRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list products' });
  }
};

export const moderateProductRouteHandler = async (req, res, productId) => {
  try {
    logger.debug(moduleName, 'moderateProductRouteHandler: enter', { productId });
    const { moderationStatus } = getRequestPayload(req);
    logger.debug(moduleName, 'moderateProductRouteHandler: payload', { moderationStatus });
    if (!['pending', 'approved', 'rejected'].includes(moderationStatus)) {
      logger.notice(moduleName, 'moderateProductRouteHandler: exit http=400', { reason: 'invalid_moderationStatus' });
      return res.status(400).json({ status: 'failure', message: 'Invalid moderationStatus' });
    }
    logger.debug(moduleName, 'moderateProductRouteHandler: ProductModel.findById');
    const p = await ProductModel.findById(productId);
    if (!p) {
      logger.notice(moduleName, 'moderateProductRouteHandler: exit http=404', { reason: 'not_found' });
      return res.status(404).json({ status: 'failure', message: 'Product not found' });
    }
    p.moderationStatus = moderationStatus;
    logger.debug(moduleName, 'moderateProductRouteHandler: save');
    await p.save();
    logger.info(moduleName, 'moderateProductRouteHandler: exit http=200', { productId: p._id?.toString(), moderationStatus });
    return res.status(200).json({ status: 'success', data: { product: p } });
  } catch (err) {
    logger.error(moduleName, `moderateProductRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'moderateProductRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to moderate product' });
  }
};

export const listCouponsAdminRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'listCouponsAdminRouteHandler: enter');
    logger.debug(moduleName, 'listCouponsAdminRouteHandler: listCoupons');
    const coupons = await listCoupons();
    logger.info(moduleName, 'listCouponsAdminRouteHandler: exit http=200', { count: coupons?.length });
    return res.status(200).json({ status: 'success', data: { coupons } });
  } catch (err) {
    logger.error(moduleName, `listCouponsAdminRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listCouponsAdminRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list coupons' });
  }
};

export const createCouponAdminRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'createCouponAdminRouteHandler: enter');
    const { code, discountType, value, expiresAt, maxRedemptions, active } = getRequestPayload(req);
    logger.debug(moduleName, 'createCouponAdminRouteHandler: payload', { code, discountType, value, expiresAt, maxRedemptions, active });
    if (!code || !discountType || value == null) {
      logger.notice(moduleName, 'createCouponAdminRouteHandler: exit http=400', { reason: 'missing_fields' });
      return res.status(400).json({ status: 'failure', message: 'code, discountType, value required' });
    }
    logger.debug(moduleName, 'createCouponAdminRouteHandler: createCoupon');
    const c = await createCoupon({
      code: String(code).toUpperCase().trim(),
      discountType,
      value: Number(value),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxRedemptions: maxRedemptions != null ? Number(maxRedemptions) : undefined,
      active: active !== false,
    });
    logger.info(moduleName, 'createCouponAdminRouteHandler: exit http=201', { couponId: c._id?.toString(), code: c.code });
    return res.status(201).json({ status: 'success', data: { coupon: c } });
  } catch (err) {
    if (err.code === 11000) {
      logger.notice(moduleName, 'createCouponAdminRouteHandler: exit http=409', { reason: 'duplicate_code' });
      return res.status(409).json({ status: 'failure', message: 'Coupon code already exists' });
    }
    logger.error(moduleName, `createCouponAdminRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'createCouponAdminRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to create coupon' });
  }
};
