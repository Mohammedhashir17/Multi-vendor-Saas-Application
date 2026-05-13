const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { asyncHandler, sendSuccess, sendError, HTTP } = require("../common/shared");
const logger = require("../common/logger");
const db = require("../db/db.operations");
const { emailService } = require("../common/email.service");

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function generateSecurePassword() {
  return crypto.randomBytes(8).toString("hex"); // 16 char — readable enough to type
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

const createVendorHandler = asyncHandler(async (req, res) => {
  const CTX = "admin.createVendorHandler";
  const { username, email, phoneNumber } = req.validatedBody;

  logger.info(CTX, "Admin initiating vendor creation", {
    email,
    adminId: req.user._id,
  });

  // ── 1. Check email not already in use ────────────────────────────────────
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) {
    logger.notice(CTX, "Vendor creation failed — email already exists", { email });
    return sendError(res, HTTP.CONFLICT, "An account with this email already exists");
  }

  // ── 2. Generate raw password and hash it ─────────────────────────────────
  const rawPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  // ── 3. Create user account ────────────────────────────────────────────────
  const newUser = await db.createAdminVendorUser({
    username,
    email,
    phoneNumber: phoneNumber ?? null,
    password: hashedPassword,
    role: "vendor",
    isVerified: true,
    mustResetPassword: true,
    createdByAdmin: true,
    accountStatus: "active",
  });

  logger.info(CTX, "Vendor user account created", { userId: newUser._id });

  // ── 4. Create vendor profile ──────────────────────────────────────────────
  const vendorProfile = await db.createVendorProfile({
    userId: newUser._id,
    businessName: username,
    businessEmail: email,
    status: "pending",
  });

  logger.info(CTX, "Vendor profile created", { vendorId: vendorProfile._id });

  // ── 5. Email vendor their temporary password ──────────────────────────────
  await emailService.sendVendorWelcomeEmail({
    to: email,
    username,
    password: rawPassword,
  });

  logger.info(CTX, "Vendor welcome email sent", { email });

  // ── 6. Respond ────────────────────────────────────────────────────────────
  return sendSuccess(res, HTTP.CREATED, "Vendor account created. Login credentials sent via email.", {
    userId: newUser._id,
    vendorId: vendorProfile._id,
    email: newUser.email,
    username: newUser.username,
  });
});

module.exports = { createVendorHandler };