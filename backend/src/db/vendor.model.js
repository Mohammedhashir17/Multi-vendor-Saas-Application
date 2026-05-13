const mongoose = require("mongoose");

const VENDOR_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one vendor profile per user
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    businessPhone: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },
    logo: {
      type: String, // URL / file path
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.PENDING,
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
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vendorSchema.index({ userId: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ businessEmail: 1 });

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
module.exports.VENDOR_STATUS = VENDOR_STATUS;