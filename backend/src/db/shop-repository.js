import { ShopModel } from './shop.model.js';

export const findShopByVendor = (vendorUserId) => ShopModel.findOne({ vendorUserId });
export const findShopById = (id) => ShopModel.findById(id);
export const listShopsByStatus = (status) => ShopModel.find({ status }).sort({ createdAt: -1 });
export const createShop = (data) => ShopModel.create(data);
export const saveShop = (doc) => doc.save();
