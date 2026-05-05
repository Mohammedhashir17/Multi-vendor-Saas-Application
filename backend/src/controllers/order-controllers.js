import * as logger from '../common/logger.js';
import { findUserById } from '../db/user-repository.js';
import { findProductById } from '../db/product-repository.js';
import { findCouponByCode, saveCoupon } from '../db/coupon-repository.js';
import {
  createOrder,
  findOrderById,
  listOrdersForCustomer,
  listOrdersForShop,
  listAllOrders,
  saveOrder,
} from '../db/order-repository.js';
import { findShopByVendor } from '../db/shop-repository.js';

const moduleName = 'order-controllers';

function gstRate() {
  return Number(process.env.GST_RATE || 0.18);
}

async function resolveLineItems(rawItems) {
  logger.debug(moduleName, 'resolveLineItems: start', { inputCount: rawItems?.length ?? 0 });
  const lines = [];
  for (const row of rawItems) {
    const p = await findProductById(row.productId);
    if (!p || !p.shopId || p.shopId.status !== 'approved' || !p.active || p.moderationStatus !== 'approved') {
      continue;
    }
    const qty = Math.max(1, Math.min(99, Number(row.qty) || 1));
    if (p.inventory < qty) {
      throw new Error(`Insufficient stock for ${p.title}`);
    }
    lines.push({
      productId: p._id,
      shopId: p.shopId._id,
      title: p.title,
      price: p.price,
      qty,
    });
  }
  logger.debug(moduleName, 'resolveLineItems: done', { resolvedCount: lines.length });
  return lines;
}

export const createOrderRouteHandler = async (req, res, userId, payload) => {
  try {
    logger.debug(moduleName, 'createOrderRouteHandler: enter', {
      userId,
      hasAddress: !!(payload?.address?.line1 && payload?.address?.city),
      itemCount: payload?.items?.length,
      couponCode: payload?.couponCode || null,
    });
    let { items, address, couponCode } = payload;
    logger.debug(moduleName, 'createOrderRouteHandler: findUserById');
    const user = await findUserById(userId);
    if (!user) {
      logger.notice(moduleName, 'createOrderRouteHandler: exit http=404', { reason: 'user_not_found' });
      return res.status(404).json({ status: 'failure', message: 'User not found' });
    }

    if (!items?.length && user.cartItems?.length) {
      logger.debug(moduleName, 'createOrderRouteHandler: items empty — use persisted cart');
      items = user.cartItems.map((c) => ({ productId: c.productId, qty: c.qty }));
    }
    if (!items?.length) {
      logger.notice(moduleName, 'createOrderRouteHandler: exit http=400', { reason: 'empty_cart' });
      return res.status(400).json({ status: 'failure', message: 'Cart is empty — add items or sync cart first' });
    }
    if (!address?.line1 || !address?.city) {
      logger.notice(moduleName, 'createOrderRouteHandler: exit http=400', { reason: 'address_required' });
      return res.status(400).json({ status: 'failure', message: 'Address with line1 and city is required' });
    }

    logger.debug(moduleName, 'createOrderRouteHandler: resolveLineItems');
    const lines = await resolveLineItems(items);
    if (!lines.length) {
      logger.notice(moduleName, 'createOrderRouteHandler: exit http=400', { reason: 'no_valid_lines' });
      return res.status(400).json({ status: 'failure', message: 'No valid products in order' });
    }

    let subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    let discount = 0;

    if (couponCode) {
      logger.debug(moduleName, 'createOrderRouteHandler: apply coupon', { couponCode });
      const c = await findCouponByCode(couponCode);
      const now = new Date();
      if (
        c &&
        c.active &&
        (!c.expiresAt || c.expiresAt > now) &&
        (!c.maxRedemptions || c.redemptions < c.maxRedemptions)
      ) {
        if (c.discountType === 'percent') {
          discount = Math.round(subtotal * (c.value / 100) * 100) / 100;
        } else {
          discount = Math.min(subtotal, c.value);
        }
        if (discount > 0) {
          c.redemptions += 1;
          logger.debug(moduleName, 'createOrderRouteHandler: saveCoupon (redemption++)');
          await saveCoupon(c);
        }
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = Math.round(afterDiscount * gstRate() * 100) / 100;
    const total = Math.round((afterDiscount + tax) * 100) / 100;
    logger.debug(moduleName, 'createOrderRouteHandler: totals', { subtotal, discount, tax, total });

    logger.debug(moduleName, 'createOrderRouteHandler: createOrder');
    const order = await createOrder({
      customerId: userId,
      items: lines,
      address,
      status: 'placed',
      statusHistory: [{ status: 'placed', at: new Date() }],
      couponCode: couponCode || '',
      subtotal,
      discount,
      tax,
      total,
    });

    logger.debug(moduleName, 'createOrderRouteHandler: clear user cart');
    user.cartItems = [];
    await user.save();

    logger.debug(moduleName, 'createOrderRouteHandler: decrement inventory');
    for (const line of lines) {
      const p = await findProductById(line.productId);
      if (p) {
        p.inventory = Math.max(0, p.inventory - line.qty);
        await p.save();
      }
    }

    logger.info(moduleName, 'createOrderRouteHandler: exit http=201', {
      orderId: order._id?.toString(),
      orderNumber: order.orderNumber,
    });
    return res.status(201).json({
      status: 'success',
      message: 'Order placed',
      data: { order: { id: order._id.toString(), orderNumber: order.orderNumber, total: order.total, status: order.status } },
    });
  } catch (err) {
    logger.error(moduleName, `createOrderRouteHandler: ${err.message}`);
    logger.notice(moduleName, 'createOrderRouteHandler: exit http=400', { error: err.message });
    return res.status(400).json({ status: 'failure', message: err.message || 'Failed to create order' });
  }
};

export const listOrdersRouteHandler = async (req, res, auth) => {
  try {
    logger.debug(moduleName, 'listOrdersRouteHandler: enter', { role: auth.role, userId: auth.userId });
    if (auth.role === 'admin') {
      logger.debug(moduleName, 'listOrdersRouteHandler: listAllOrders');
      const orders = await listAllOrders();
      logger.info(moduleName, 'listOrdersRouteHandler: exit http=200', { count: orders?.length });
      return res.status(200).json({ status: 'success', data: { orders } });
    }
    if (auth.role === 'vendor') {
      logger.debug(moduleName, 'listOrdersRouteHandler: findShopByVendor + listOrdersForShop');
      const shop = await findShopByVendor(auth.userId);
      if (!shop) {
        logger.info(moduleName, 'listOrdersRouteHandler: exit http=200', { count: 0, note: 'no_shop' });
        return res.status(200).json({ status: 'success', data: { orders: [] } });
      }
      const orders = await listOrdersForShop(shop._id);
      logger.info(moduleName, 'listOrdersRouteHandler: exit http=200', { count: orders?.length });
      return res.status(200).json({ status: 'success', data: { orders } });
    }
    logger.debug(moduleName, 'listOrdersRouteHandler: listOrdersForCustomer');
    const orders = await listOrdersForCustomer(auth.userId);
    logger.info(moduleName, 'listOrdersRouteHandler: exit http=200', { count: orders?.length });
    return res.status(200).json({ status: 'success', data: { orders } });
  } catch (err) {
    logger.error(moduleName, `listOrdersRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'listOrdersRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to list orders' });
  }
};

export const getOrderRouteHandler = async (req, res, auth, orderId) => {
  try {
    logger.debug(moduleName, 'getOrderRouteHandler: enter', { orderId, role: auth.role, userId: auth.userId });
    logger.debug(moduleName, 'getOrderRouteHandler: findOrderById');
    const order = await findOrderById(orderId);
    if (!order) {
      logger.notice(moduleName, 'getOrderRouteHandler: exit http=404', { reason: 'not_found' });
      return res.status(404).json({ status: 'failure', message: 'Order not found' });
    }

    if (auth.role === 'admin') {
      logger.info(moduleName, 'getOrderRouteHandler: exit http=200', { via: 'admin' });
      return res.status(200).json({ status: 'success', data: { order } });
    }
    const custId = order.customerId?._id?.toString() || order.customerId?.toString();
    if (custId === auth.userId) {
      logger.info(moduleName, 'getOrderRouteHandler: exit http=200', { via: 'customer' });
      return res.status(200).json({ status: 'success', data: { order } });
    }
    if (auth.role === 'vendor') {
      logger.debug(moduleName, 'getOrderRouteHandler: vendor shop check');
      const shop = await findShopByVendor(auth.userId);
      if (shop && order.items.some((i) => i.shopId.toString() === shop._id.toString())) {
        logger.info(moduleName, 'getOrderRouteHandler: exit http=200', { via: 'vendor' });
        return res.status(200).json({ status: 'success', data: { order } });
      }
    }
    logger.notice(moduleName, 'getOrderRouteHandler: exit http=403', { reason: 'forbidden' });
    return res.status(403).json({ status: 'failure', message: 'Forbidden' });
  } catch (err) {
    logger.error(moduleName, `getOrderRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'getOrderRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to load order' });
  }
};

const NEXT_STATUS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const updateOrderStatusRouteHandler = async (req, res, auth, orderId, nextStatus) => {
  try {
    logger.debug(moduleName, 'updateOrderStatusRouteHandler: enter', { orderId, nextStatus, role: auth.role });
    logger.debug(moduleName, 'updateOrderStatusRouteHandler: findOrderById');
    const order = await findOrderById(orderId);
    if (!order) {
      logger.notice(moduleName, 'updateOrderStatusRouteHandler: exit http=404', { reason: 'not_found' });
      return res.status(404).json({ status: 'failure', message: 'Order not found' });
    }

    if (auth.role !== 'admin' && auth.role !== 'vendor') {
      logger.notice(moduleName, 'updateOrderStatusRouteHandler: exit http=403', { reason: 'role' });
      return res.status(403).json({ status: 'failure', message: 'Forbidden' });
    }

    if (auth.role === 'vendor') {
      logger.debug(moduleName, 'updateOrderStatusRouteHandler: vendor owns line item check');
      const shop = await findShopByVendor(auth.userId);
      if (!shop || !order.items.some((i) => i.shopId.toString() === shop._id.toString())) {
        logger.notice(moduleName, 'updateOrderStatusRouteHandler: exit http=403', { reason: 'not_vendor_order' });
        return res.status(403).json({ status: 'failure', message: 'This order does not include your shop' });
      }
    }

    const allowed = NEXT_STATUS[order.status] || [];
    logger.debug(moduleName, 'updateOrderStatusRouteHandler: validate transition', { from: order.status, to: nextStatus, allowed });
    if (!allowed.includes(nextStatus)) {
      logger.notice(moduleName, 'updateOrderStatusRouteHandler: exit http=400', { reason: 'invalid_transition' });
      return res.status(400).json({ status: 'failure', message: `Cannot transition from ${order.status} to ${nextStatus}` });
    }

    order.status = nextStatus;
    order.statusHistory.push({ status: nextStatus, at: new Date() });
    logger.debug(moduleName, 'updateOrderStatusRouteHandler: saveOrder');
    await saveOrder(order);

    logger.info(moduleName, 'updateOrderStatusRouteHandler: exit http=200', { status: order.status });
    return res.status(200).json({ status: 'success', message: 'Order updated', data: { status: order.status } });
  } catch (err) {
    logger.error(moduleName, `updateOrderStatusRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'updateOrderStatusRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Failed to update order' });
  }
};
