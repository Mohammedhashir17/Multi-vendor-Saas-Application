const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationInDays: {
      type: Number,
      required: true,
      min: 1,
    },
    // How many shops this plan allows
    maxShops: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ name: 1 }, { unique: true });

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

module.exports = SubscriptionPlan;