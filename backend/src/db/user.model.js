import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true },
    titleSnapshot: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Empty for Google-only accounts; local users always have a bcrypt hash. */
    passwordHash: { type: String, default: '' },
    /** Digits-only normalized string (min 10 chars enforced in app layer). Sparse so Google users may omit. */
    mobile: { type: String, sparse: true, unique: true, trim: true },
    name: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    businessName: { type: String, default: '' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    isVerified: { type: Boolean, default: true },
    googleSub: { type: String, sparse: true, unique: true, trim: true },
    /** Vendor trial (Flow: 7–14 days) — default 14 from registration */
    vendorTrialEndsAt: { type: Date },
    subscriptionPlan: { type: String, enum: ['none', 'basic', 'pro', 'premium'], default: 'none' },
    subscriptionExpiresAt: { type: Date },
    subscriptionActive: { type: Boolean, default: false },
    cartItems: { type: [cartItemSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    /** bcrypt hash of one-time password reset code; cleared after use */
    passwordResetOtpHash: { type: String },
    passwordResetOtpExpiresAt: { type: Date },
    /** bcrypt hash of signup OTP; present only while local registration is pending */
    registrationOtpHash: { type: String },
    registrationOtpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
