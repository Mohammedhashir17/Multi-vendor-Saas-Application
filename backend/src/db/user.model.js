const mongoose = require("mongoose");
const { ROLES, ALLOWED_ROLES } = require("../common/shared");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username must not exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    role: {
      type: String,
      enum: {
        values: ALLOWED_ROLES,
        message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
      },
      default: ROLES.CUSTOMER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    failedLoginAttempts: {
    type: Number,
    default: 0,
    },
    lockUntil: {
    type: Date,
    default: null,
    },
    lastLoginAt: {
    type: Date,
    default: null,
    },
    accountStatus: {
    type: String,
    enum: ["active", "suspended", "deleted"],
    default: "active",
    },
    // ─── NEW FIELDS ───────────────────────────────────────────────
    mustResetPassword: {
      type: Boolean,
      default: false,
    },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;