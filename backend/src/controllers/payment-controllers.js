import * as logger from '../common/logger.js';
import { getRequestPayload } from '../common/shared.js';
import { findOrderById, saveOrder } from '../db/order-repository.js';

const moduleName = 'payment-controllers';

/** Dummy payment — confirms order (Customer Flow: Dummy Payment → tracking). */
export const processDummyPaymentRouteHandler = async (req, res, userId) => {
  try {
    logger.debug(moduleName, 'processDummyPaymentRouteHandler: enter', { userId });
    const { orderId } = getRequestPayload(req);
    logger.debug(moduleName, 'processDummyPaymentRouteHandler: parsed body', { orderId });
    if (!orderId) {
      logger.notice(moduleName, 'processDummyPaymentRouteHandler: exit http=400', { reason: 'orderId_required' });
      return res.status(400).json({ status: 'failure', message: 'orderId required' });
    }

    logger.debug(moduleName, 'processDummyPaymentRouteHandler: findOrderById');
    const order = await findOrderById(orderId);
    if (!order) {
      logger.notice(moduleName, 'processDummyPaymentRouteHandler: exit http=404', { reason: 'order_not_found' });
      return res.status(404).json({ status: 'failure', message: 'Order not found' });
    }

    const custId = order.customerId?._id?.toString() || order.customerId?.toString();
    logger.debug(moduleName, 'processDummyPaymentRouteHandler: ownership check', { custId });
    if (custId !== userId) {
      logger.notice(moduleName, 'processDummyPaymentRouteHandler: exit http=403', { reason: 'forbidden' });
      return res.status(403).json({ status: 'failure', message: 'Forbidden' });
    }

    if (order.status === 'cancelled') {
      logger.notice(moduleName, 'processDummyPaymentRouteHandler: exit http=400', { reason: 'cancelled' });
      return res.status(400).json({ status: 'failure', message: 'Order was cancelled' });
    }

    logger.debug(moduleName, 'processDummyPaymentRouteHandler: set payment + maybe confirm');
    order.payment = order.payment || {};
    order.payment.method = 'dummy';
    order.payment.dummyConfirmedAt = new Date();

    if (order.status === 'placed') {
      order.status = 'confirmed';
      order.statusHistory.push({ status: 'confirmed', at: new Date() });
    }

    logger.debug(moduleName, 'processDummyPaymentRouteHandler: saveOrder');
    await saveOrder(order);
    logger.info(moduleName, 'processDummyPaymentRouteHandler: exit http=200', {
      orderId: order._id?.toString(),
      status: order.status,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Payment recorded (dummy)',
      data: { orderId: order._id.toString(), status: order.status },
    });
  } catch (err) {
    logger.error(moduleName, `processDummyPaymentRouteHandler: ${err.message}`);
    logger.debug(moduleName, 'processDummyPaymentRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Payment failed' });
  }
};
