import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    images: [{ type: String }],
    category: { type: String, default: 'general' },
    inventory: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    variantsNote: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ shopId: 1, title: 1 });

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
