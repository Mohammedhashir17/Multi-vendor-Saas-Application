import { CouponModel } from './coupon.model.js';

export const findCouponByCode = (code) =>
  CouponModel.findOne({ code: code.toUpperCase().trim(), active: true });

export const createCoupon = (data) => CouponModel.create(data);
export const listCoupons = () => CouponModel.find({}).sort({ createdAt: -1 }).lean();
export const saveCoupon = (doc) => doc.save();
