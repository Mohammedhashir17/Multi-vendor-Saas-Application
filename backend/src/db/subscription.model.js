const mongoose = require("mongoose");

const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  TRIAL: "trial",
};

const subscriptionSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Quickly find a vendor's current active subscription
subscriptionSchema.index({ vendorId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 }); // for expiry cron jobs
subscriptionSchema.index({ vendorId: 1, endDate: -1 }); // latest first per vendor

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
module.exports.SUBSCRIPTION_STATUS = SUBSCRIPTION_STATUS;