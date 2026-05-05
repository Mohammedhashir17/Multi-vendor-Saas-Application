import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { findShopByVendor, createShop, saveShop } from '../db/shop-repository.js';
import {
  listVendorProducts,
  createProduct,
  findProductForVendor,
  generateUniqueProductSlug,
} from '../db/product-repository.js';

const moduleName = 'vendor-controllers';

export const getMyShopRouteHandler = async (req, res, vendorUserId) => {
  try {
    logger.debug(moduleName, 'getMyShopRouteHandler: enter', { vendorUserId });
    logger.debug(moduleName, 'getMyShopRouteHandler: findShopByVendor');
    const shop = await findShopByVendor(vendorUserId);
    logger.info(moduleName, 'getMyShopRouteHandler: exit http=200', { hasShop: !!shop });
    return res.status(200).json({ status: 'success', data: { shop: shop ? shop.toObject?.() ?? shop : null } });
  } catch (err) {
    logger.error(moduleName, `getMyShopRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'getMyShopRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to load shop' });
  }
};

export const createShopRouteHandler = async (req, res, vendorUserId) => {
  try {
    logger.debug(moduleName, 'createShopRouteHandler: enter', { vendorUserId });
    logger.debug(moduleName, 'createShopRouteHandler: findShopByVendor (exists?)');
    const existing = await findShopByVendor(vendorUserId);
    if (existing) {
      logger.notice(moduleName, 'createShopRouteHandler: exit http=409', { reason: 'shop_exists' });
      return res.status(409).json({ status: 'failure', message: 'Shop already exists — use update' });
    }
    const { name, description, logoUrl, bannerUrl } = getRequestPayload(req);
    if (!name?.trim()) {
      logger.notice(moduleName, 'createShopRouteHandler: exit http=400', { reason: 'name_required' });
      return res.status(400).json({ status: 'failure', message: 'Shop name is required' });
    }
    logger.debug(moduleName, 'createShopRouteHandler: createShop', { name: name.trim() });
    const shop = await createShop({
      vendorUserId,
      name: name.trim(),
      description: description || '',
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
      status: 'pending',
    });
    logger.info(moduleName, 'createShopRouteHandler: exit http=201', { shopId: shop._id?.toString() });
    return res.status(201).json({ status: 'success', data: { shop } });
  } catch (err) {
    logger.error(moduleName, `createShopRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'createShopRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to create shop' });
  }
};

export const updateShopRouteHandler = async (req, res, vendorUserId) => {
  try {
    logger.debug(moduleName, 'updateShopRouteHandler: enter', { vendorUserId });
    logger.debug(moduleName, 'updateShopRouteHandler: findShopByVendor');
    const shop = await findShopByVendor(vendorUserId);
    if (!shop) {
      logger.notice(moduleName, 'updateShopRouteHandler: exit http=404', { reason: 'shop_not_found' });
      return res.status(404).json({ status: 'failure', message: 'Shop not found' });
    }
    const { name, description, logoUrl, bannerUrl } = getRequestPayload(req);
    logger.debug(moduleName, 'updateShopRouteHandler: apply field updates');
    if (name != null) shop.name = String(name).trim() || shop.name;
    if (description != null) shop.description = String(description);
    if (logoUrl != null) shop.logoUrl = String(logoUrl);
    if (bannerUrl != null) shop.bannerUrl = String(bannerUrl);
    logger.debug(moduleName, 'updateShopRouteHandler: saveShop');
    await saveShop(shop);
    logger.info(moduleName, 'updateShopRouteHandler: exit http=200', { shopId: shop._id?.toString() });
    return res.status(200).json({ status: 'success', data: { shop } });
  } catch (err) {
    logger.error(moduleName, `updateShopRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'updateShopRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to update shop' });
  }
};

export const listMyProductsRouteHandler = async (req, res, vendorUserId) => {
  try {
    logger.debug(moduleName, 'listMyProductsRouteHandler: enter', { vendorUserId });
    logger.debug(moduleName, 'listMyProductsRouteHandler: listVendorProducts');
    const products = await listVendorProducts(vendorUserId);
    logger.info(moduleName, 'listMyProductsRouteHandler: exit http=200', { count: products?.length });
    return res.status(200).json({ status: 'success', data: { products } });
  } catch (err) {
    logger.error(moduleName, `listMyProductsRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listMyProductsRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list products' });
  }
};

export const createProductRouteHandler = async (req, res, vendorUserId, shop) => {
  try {
    logger.debug(moduleName, 'createProductRouteHandler: enter', { vendorUserId, shopId: shop?._id?.toString() });
    const { title, description, price, compareAtPrice, images, category, inventory, variantsNote } = getRequestPayload(req);
    if (!title?.trim() || price == null) {
      logger.notice(moduleName, 'createProductRouteHandler: exit http=400', { reason: 'title_price_required' });
      return res.status(400).json({ status: 'failure', message: 'title and price are required' });
    }
    logger.debug(moduleName, 'createProductRouteHandler: generateUniqueProductSlug');
    const slug = await generateUniqueProductSlug(title);
    logger.debug(moduleName, 'createProductRouteHandler: createProduct');
    const p = await createProduct({
      shopId: shop._id,
      vendorUserId,
      title: title.trim(),
      slug,
      description: description || '',
      price: Number(price),
      compareAtPrice: compareAtPrice != null ? Number(compareAtPrice) : undefined,
      images: Array.isArray(images) ? images : [],
      category: category || 'general',
      inventory: Math.max(0, Number(inventory) || 0),
      active: true,
      moderationStatus: 'pending',
      variantsNote: variantsNote || '',
    });
    logger.info(moduleName, 'createProductRouteHandler: exit http=201', { productId: p._id?.toString(), slug });
    return res.status(201).json({ status: 'success', data: { product: p } });
  } catch (err) {
    logger.error(moduleName, `createProductRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'createProductRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to create product' });
  }
};

export const updateProductRouteHandler = async (req, res, vendorUserId, productId) => {
  try {
    logger.debug(moduleName, 'updateProductRouteHandler: enter', { vendorUserId, productId });
    logger.debug(moduleName, 'updateProductRouteHandler: findProductForVendor');
    const p = await findProductForVendor(productId, vendorUserId);
    if (!p) {
      logger.notice(moduleName, 'updateProductRouteHandler: exit http=404', { reason: 'product_not_found' });
      return res.status(404).json({ status: 'failure', message: 'Product not found' });
    }
    const body = getRequestPayload(req);
    logger.debug(moduleName, 'updateProductRouteHandler: apply updates');
    if (body.title != null && String(body.title).trim()) {
      const nt = String(body.title).trim();
      if (nt !== p.title) {
        p.title = nt;
        p.slug = await generateUniqueProductSlug(nt);
      }
    }
    if (body.description != null) p.description = String(body.description);
    if (body.price != null) p.price = Number(body.price);
    if (body.compareAtPrice != null) p.compareAtPrice = Number(body.compareAtPrice);
    if (body.images != null) p.images = Array.isArray(body.images) ? body.images : p.images;
    if (body.category != null) p.category = String(body.category);
    if (body.inventory != null) p.inventory = Math.max(0, Number(body.inventory) || 0);
    if (body.variantsNote != null) p.variantsNote = String(body.variantsNote);
    if (body.active != null) p.active = Boolean(body.active);

    const touchedContent =
      body.title != null ||
      body.description != null ||
      body.price != null ||
      body.images != null ||
      body.category != null;
    if (touchedContent) p.moderationStatus = 'pending';

    logger.debug(moduleName, 'updateProductRouteHandler: product.save');
    await p.save();
    logger.info(moduleName, 'updateProductRouteHandler: exit http=200', { productId: p._id?.toString() });
    return res.status(200).json({ status: 'success', data: { product: p } });
  } catch (err) {
    logger.error(moduleName, `updateProductRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'updateProductRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to update product' });
  }
};
