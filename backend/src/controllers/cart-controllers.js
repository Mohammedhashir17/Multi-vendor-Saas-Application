import * as logger from '../common/logger.js';
import { findUserById, updateUserCart } from '../db/user-repository.js';
import { findProductById } from '../db/product-repository.js';

const moduleName = 'cart-controllers';

export const getCartRouteHandler = async (req, res, userId) => {
  try {
    logger.debug(moduleName, 'getCartRouteHandler: enter', { userId });
    logger.debug(moduleName, 'getCartRouteHandler: findUserById');
    const user = await findUserById(userId);
    if (!user) {
      logger.notice(moduleName, 'getCartRouteHandler: exit http=404', { reason: 'user_not_found' });
      return res.status(404).json({ status: 'failure', message: 'User not found' });
    }
    const n = user.cartItems?.length ?? 0;
    logger.info(moduleName, 'getCartRouteHandler: exit http=200', { itemCount: n });
    return res.status(200).json({ status: 'success', data: { items: user.cartItems || [] } });
  } catch (err) {
    logger.error(moduleName, `getCartRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'getCartRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to load cart' });
  }
};

export const syncCartRouteHandler = async (req, res, userId, bodyItems) => {
  try {
    logger.debug(moduleName, 'syncCartRouteHandler: enter', { userId, rawLineCount: bodyItems?.length ?? 0 });
    const normalized = [];
    let skipped = 0;
    logger.debug(moduleName, 'syncCartRouteHandler: normalize lines (validate products)');
    for (const line of bodyItems || []) {
      const { productId, qty } = line;
      if (!productId || !qty) {
        skipped += 1;
        continue;
      }
      const p = await findProductById(productId);
      if (!p || !p.shopId || p.shopId.status !== 'approved' || p.moderationStatus !== 'approved' || !p.active) {
        skipped += 1;
        continue;
      }
      normalized.push({
        productId: p._id,
        qty: Math.min(99, Math.max(1, Number(qty))),
        priceSnapshot: p.price,
        titleSnapshot: p.title,
      });
    }
    logger.debug(moduleName, 'syncCartRouteHandler: updateUserCart', { normalizedCount: normalized.length, skipped });
    const user = await updateUserCart(userId, normalized);
    logger.info(moduleName, 'syncCartRouteHandler: exit http=200', { savedCount: user.cartItems?.length });
    return res.status(200).json({ status: 'success', data: { items: user.cartItems } });
  } catch (err) {
    logger.error(moduleName, `syncCartRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'syncCartRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to sync cart' });
  }
};
