import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true, sparse: true },
    items: { type: [orderItemSchema], required: true },
    address: {
      fullName: String,
      line1: String,
      city: String,
      state: String,
      pin: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusHistory: { type: [statusEntrySchema], default: [] },
    couponCode: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: {
      method: { type: String, default: 'dummy' },
      dummyConfirmedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
