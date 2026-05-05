import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    maxRedemptions: { type: Number },
    redemptions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
