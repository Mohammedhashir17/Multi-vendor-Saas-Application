const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh token hash is required"],
    },
    device: {
      type: String,
      required: [true, "Device identifier is required"],
      trim: true,
    },
    ip: {
      type: String,
      required: [true, "IP address is required"],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: { expireAfterSeconds: 0 }, 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sessionSchema.index({ userId: 1, device: 1 });
sessionSchema.index({ userId: 1, createdAt: 1 });

sessionSchema.statics.generateExpiresAt = function () {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
};

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;