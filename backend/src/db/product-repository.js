import mongoose from 'mongoose';
import { ProductModel } from './product.model.js';
import { ShopModel } from './shop.model.js';
import { slugify } from '../common/shared.js';

function publicProductFilter() {
  return {
    active: true,
    moderationStatus: 'approved',
  };
}

export async function findProductById(id) {
  return ProductModel.findById(id).populate('shopId', 'name status vendorUserId');
}

export async function findProductBySlug(slug) {
  return ProductModel.findOne({ slug: slug.toLowerCase() }).populate('shopId', 'name status vendorUserId');
}

export async function listProducts({ category, q, shopId, page = 1, limit = 24 }) {
  const approvedShops = await ShopModel.find({ status: 'approved' }).select('_id').lean();
  const approvedIds = approvedShops.map((s) => s._id);

  const filter = { ...publicProductFilter(), shopId: { $in: approvedIds } };
  if (category) filter.category = category;
  if (shopId) {
    if (!approvedIds.some((id) => id.toString() === shopId)) {
      return { items: [], total: 0, page, limit };
    }
    filter.shopId = new mongoose.Types.ObjectId(shopId);
  }

  const skip = (Math.max(1, page) - 1) * limit;
  const lim = Math.min(100, Number(limit) || 24);

  if (q) {
    const qFilter = {
      ...filter,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    };
    const [items, total] = await Promise.all([
      ProductModel.find(qFilter).populate('shopId', 'name status').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      ProductModel.countDocuments(qFilter),
    ]);
    return { items, total, page, limit: lim };
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter).populate('shopId', 'name status').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    ProductModel.countDocuments(filter),
  ]);
  return { items, total, page, limit: lim };
}

export async function listVendorProducts(vendorUserId) {
  return ProductModel.find({ vendorUserId }).sort({ createdAt: -1 }).lean();
}

export async function createProduct(data) {
  return ProductModel.create(data);
}

export async function findProductForVendor(productId, vendorUserId) {
  return ProductModel.findOne({ _id: productId, vendorUserId });
}

export async function listPendingProducts() {
  return ProductModel.find({ moderationStatus: 'pending' }).populate('shopId', 'name').sort({ createdAt: -1 }).lean();
}

export async function generateUniqueProductSlug(title) {
  const base = slugify(title) || 'product';
  let slug = base;
  let n = 0;
  while (await ProductModel.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
