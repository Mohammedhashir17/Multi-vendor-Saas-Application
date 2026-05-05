import { OrderModel } from './order.model.js';

function genOrderNumber() {
  return `BAZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function createOrder(doc) {
  const payload = { ...doc, orderNumber: doc.orderNumber || genOrderNumber() };
  return OrderModel.create(payload);
}

export async function findOrderById(id) {
  return OrderModel.findById(id).populate('customerId', 'name email').populate('items.productId', 'title slug');
}

export async function listOrdersForCustomer(customerId) {
  return OrderModel.find({ customerId }).sort({ createdAt: -1 }).lean();
}

/** Orders containing at least one line item for given shop */
export async function listOrdersForShop(shopId) {
  return OrderModel.find({ 'items.shopId': shopId }).sort({ createdAt: -1 }).lean();
}

export async function listAllOrders() {
  return OrderModel.find({}).sort({ createdAt: -1 }).limit(500).lean();
}

export async function saveOrder(doc) {
  return doc.save();
}
