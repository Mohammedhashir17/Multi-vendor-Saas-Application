const mongoose = require("mongoose");
const { OTP_CONFIG } = require("../common/shared");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true, 
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    isVerified: {             
      type: Boolean,
      default: false,
      index: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 60 }
);

// expiry generator
otpSchema.statics.generateExpiresAt = function () {
  return new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
};

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;