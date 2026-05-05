import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ShopModel = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
