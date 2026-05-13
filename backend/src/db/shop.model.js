const mongoose = require("mongoose");

const SHOP_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const shopSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String, // URL / file path
      default: null,
    },
    banner: {
      type: String, // URL / file path
      default: null,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(SHOP_STATUS),
      default: SHOP_STATUS.PENDING,
    },
    // Only true when status = approved AND vendor has an active subscription
    isLive: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin user
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

shopSchema.index({ vendorId: 1 });
shopSchema.index({ slug: 1 }, { unique: true });
shopSchema.index({ status: 1 });
shopSchema.index({ isLive: 1 });
shopSchema.index({ vendorId: 1, status: 1 }); // compound: list vendor's approved shops

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;
module.exports.SHOP_STATUS = SHOP_STATUS;