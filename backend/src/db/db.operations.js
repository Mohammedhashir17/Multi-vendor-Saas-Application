/**
 * db-operations.js — All database query functions for auth domain.
 * Controllers call these; no raw Mongoose queries leak into business logic.
 */

const User = require("./user.model");
const OTP = require("./otp.model");
const Session = require("./session.model");

const logger = require("../common/logger");

const Vendor = require("./vendor.model");
const Shop = require("./shop.model");
const SubscriptionPlan = require("./subscription-plan.model");
const Subscription = require("./subscription.model");

const { VENDOR_STATUS } = require("./vendor.model");
const { SHOP_STATUS } = require("./shop.model");
const { SUBSCRIPTION_STATUS } = require("./subscription.model");

const CTX = "dbOperations"; // logging context prefix

// ─── User Operations ──────────────────────────────────────────────────────────

async function findUserByEmail(email) {
  logger.debug(`${CTX}.findUserByEmail`, "Querying user by email", { email });
  return User.findOne({ email: email.toLowerCase() });
}

async function findUserById(userId) {
  logger.debug(`${CTX}.findUserById`, "Querying user by ID", { userId });
  return User.findById(userId);
}

// FIXED — handles null email or null phoneNumber safely
async function findUserByEmailOrPhone(email, phoneNumber) {
  logger.debug("dbOperations.findUserByEmailOrPhone", "Looking up user by email or phone", { email, phoneNumber });

  const conditions = [];
  if (email)       conditions.push({ email: email.toLowerCase() });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length === 0) return null;

  return User.findOne({ $or: conditions });
}

async function createUser(userData) {
  logger.debug(`${CTX}.createUser`, "Inserting new user document", {
    email: userData.email,
    role: userData.role,
  });
  const user = new User(userData);
  return user.save();
}

async function markUserVerified(userId) {
  logger.debug(`${CTX}.markUserVerified`, "Updating isVerified to true", {
    userId,
  });
  return User.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true, runValidators: false }
  );
}

// ─── OTP Operations ───────────────────────────────────────────────────────────

async function deleteOtpsByUserId(userId) {
  logger.debug(`${CTX}.deleteOtpsByUserId`, "Deleting all OTPs for user", {
    userId,
  });
  return OTP.deleteMany({ userId });
}

async function createOtpRecord(otpData) {
  logger.debug(`${CTX}.createOtpRecord`, "Inserting OTP record", {
    userId: otpData.userId,
    expiresAt: otpData.expiresAt,
  });
  const otp = new OTP(otpData);
  return otp.save();
}

async function findLatestActiveOtpByUserId(userId) {
  logger.debug(
    `${CTX}.findLatestActiveOtpByUserId`,
    "Fetching latest active OTP",
    { userId }
  );
  return OTP.findOne({ userId, isUsed: false }).sort({ createdAt: -1 });
}

async function incrementOtpAttempts(otpId) {
  logger.debug(`${CTX}.incrementOtpAttempts`, "Incrementing OTP attempts", {
    otpId,
  });
  return OTP.findByIdAndUpdate(
    otpId,
    { $inc: { attempts: 1 } },
    { new: true }
  );
}

async function markOtpAsUsed(otpId) {
  logger.debug(`${CTX}.markOtpAsUsed`, "Marking OTP as used", { otpId });
  return OTP.findByIdAndUpdate(otpId, { isUsed: true }, { new: true });
}

async function invalidateAllOtpsByUserId(userId) {
  logger.debug(
    `${CTX}.invalidateAllOtpsByUserId`,
    "Invalidating all OTPs for user",
    { userId }
  );
  return OTP.updateMany({ userId, isUsed: false }, { isUsed: true });
}

// ─────────────────────────────────────────────
// SESSION OPERATIONS
// ─────────────────────────────────────────────

/**
 * Find an active (non-revoked) session by userId + device
 */
async function findActiveSessionByDevice(userId, device) {
  logger.debug("db.findActiveSessionByDevice", "Querying active session", { userId, device });
  return Session.findOne({ userId, device, isRevoked: false });
}

/**
 * Revoke a session by its ID
 */
async function revokeSessionById(sessionId) {
  logger.debug("db.revokeSessionById", "Revoking session", { sessionId });
  return Session.findByIdAndUpdate(sessionId, { isRevoked: true }, { new: true });
}

/**
 * Count active sessions for a user
 */
async function countActiveSessionsByUserId(userId) {
  logger.debug("db.countActiveSessionsByUserId", "Counting active sessions", { userId });
  return Session.countDocuments({ userId, isRevoked: false });
}

/**
 * Find the oldest active session for a user (for max-device eviction)
 */
async function findOldestActiveSessionByUserId(userId) {
  logger.debug("db.findOldestActiveSessionByUserId", "Finding oldest session", { userId });
  return Session.findOne({ userId, isRevoked: false }).sort({ createdAt: 1 });
}

/**
 * Create a new session record
 */
async function createSession({ userId, refreshTokenHash, device, ip, expiresAt }) {
  logger.debug("db.createSession", "Creating session", { userId, device, ip });
  return Session.create({ userId, refreshTokenHash, device, ip, expiresAt });
}

/**
 * Increment failed login attempts on a user
 */
async function incrementFailedLoginAttempts(userId) {
  logger.debug("db.incrementFailedLoginAttempts", "Incrementing failed attempts", { userId });
  return User.findByIdAndUpdate(
    userId,
    { $inc: { failedLoginAttempts: 1 } },
    { new: true }
  );
}

/**
 * Lock a user account until a given date
 */
async function lockUserAccount(userId, lockUntil) {
  logger.debug("db.lockUserAccount", "Locking account", { userId, lockUntil });
  return User.findByIdAndUpdate(userId, { lockUntil }, { new: true });
}

/**
 * Reset failed attempts and update lastLoginAt on successful login
 */
async function recordSuccessfulLogin(userId) {
  logger.debug("db.recordSuccessfulLogin", "Recording successful login", { userId });
  return User.findByIdAndUpdate(
    userId,
    { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
    { new: true }
  );
}


// ── Password Reset — OTP helpers ──────────────────────────────────────────────
 
/**
 * Count how many OTPs were created for a user within the given time window.
 * Used for rate-limiting forgot-password requests.
 *
 * @param {ObjectId} userId
 * @param {number}   windowMs  - look-back window in milliseconds
 * @returns {Promise<number>}
 */
async function countRecentOtpsByUserId(userId, windowMs) {
  const since = new Date(Date.now() - windowMs);
  logger.debug("db.countRecentOtpsByUserId", "Counting recent OTPs", {
    userId,
    since,
  });
  return OTP.countDocuments({ userId, createdAt: { $gte: since } });
}
 
/**
 * Mark an OTP record as verified (isVerified = true) WITHOUT consuming it.
 * The OTP is only marked isUsed = true after the password is actually reset.
 *
 * @param {ObjectId} otpId
 * @returns {Promise<void>}
 */
async function markOtpVerified(otpId) {
  logger.debug("db.markOtpVerified", "Marking OTP as verified", { otpId });
  await OTP.findByIdAndUpdate(otpId, { isVerified: true });
}
 
/**
 * Find the latest OTP for a user that:
 *   - is verified (isVerified = true)
 *   - has NOT been consumed (isUsed = false)
 *
 * Used as the final guard before executing the password reset.
 *
 * @param {ObjectId} userId
 * @returns {Promise<OTPDocument|null>}
 */
async function findVerifiedUnusedOtpByUserId(userId) {
  logger.debug("db.findVerifiedUnusedOtpByUserId", "Looking for verified unused OTP", {
    userId,
  });
  return OTP.findOne({ userId, isVerified: true, isUsed: false }).sort({
    createdAt: -1,
  });
}
 
// ── Password Reset — User helpers ─────────────────────────────────────────────
 
/**
 * Update a user's hashed password.
 *
 * @param {ObjectId} userId
 * @param {string}   passwordHash  - bcrypt hash of the new password
 * @returns {Promise<void>}
 */
async function updateUserPassword(userId, passwordHash) {
  logger.debug("db.updateUserPassword", "Updating user password hash", { userId });
  await User.findByIdAndUpdate(userId, { password: passwordHash });
}
 
// ── Password Reset — Session helpers ─────────────────────────────────────────

// logout and logout all 

async function findActiveSessionsByUserId(userId) {
  logger.debug("db.findActiveSessionsByUserId", "Fetching all active sessions", { userId });
  return Session.find({ userId, isRevoked: false });
}

/**
 * Revoke all active sessions for a user (logout-all)
 * Returns the number of sessions revoked.
 */
async function revokeAllSessionsByUserId(userId) {
  const CTX = "db.revokeAllSessionsByUserId";
  logger.debug(CTX, "Revoking all sessions for user", { userId });
  const result = await Session.updateMany(
    { userId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
  return result.modifiedCount;
}


// ─────────────────────────────────────────────────────────────────────────────
// VENDOR OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function createVendorProfile(vendorData) {
  const CTX = "db.createVendorProfile";
  logger.debug(CTX, "Creating vendor profile", { userId: vendorData.userId });
  const vendor = new Vendor(vendorData);
  return await vendor.save();
}

async function findVendorByUserId(userId) {
  const CTX = "db.findVendorByUserId";
  logger.debug(CTX, "Finding vendor by userId", { userId });
  return await Vendor.findOne({ userId }).lean();
}

async function findVendorById(vendorId) {
  const CTX = "db.findVendorById";
  logger.debug(CTX, "Finding vendor by id", { vendorId });
  return await Vendor.findById(vendorId).lean();
}

async function approveVendor(vendorId, adminUserId) {
  const CTX = "db.approveVendor";
  logger.debug(CTX, "Approving vendor", { vendorId, adminUserId });
  return await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $set: {
        status: VENDOR_STATUS.APPROVED,
        approvedBy: adminUserId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    },
    { new: true }
  ).lean();
}

async function rejectVendor(vendorId, reason) {
  const CTX = "db.rejectVendor";
  logger.debug(CTX, "Rejecting vendor", { vendorId });
  return await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $set: {
        status: VENDOR_STATUS.REJECTED,
        rejectionReason: reason,
        approvedBy: null,
        approvedAt: null,
      },
    },
    { new: true }
  ).lean();
}

async function suspendVendor(vendorId) {
  const CTX = "db.suspendVendor";
  logger.debug(CTX, "Suspending vendor", { vendorId });
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $set: { status: VENDOR_STATUS.SUSPENDED } },
    { new: true }
  ).lean();
}


// ─────────────────────────────────────────────────────────────────────────────
// SHOP OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function createShop(shopData) {
  const CTX = "db.createShop";
  logger.debug(CTX, "Creating shop", { vendorId: shopData.vendorId });
  const shop = new Shop(shopData);
  return await shop.save();
}

async function findShopById(shopId) {
  const CTX = "db.findShopById";
  logger.debug(CTX, "Finding shop by id", { shopId });
  return await Shop.findById(shopId).lean();
}

async function findShopsByVendorId(vendorId, status = null) {
  const CTX = "db.findShopsByVendorId";
  logger.debug(CTX, "Finding shops by vendorId", { vendorId, status });
  const query = { vendorId };
  if (status) query.status = status;
  return await Shop.find(query).sort({ createdAt: -1 }).lean();
}

async function approveShop(shopId, adminUserId) {
  const CTX = "db.approveShop";
  logger.debug(CTX, "Approving shop", { shopId, adminUserId });
  return await Shop.findByIdAndUpdate(
    shopId,
    {
      $set: {
        status: SHOP_STATUS.APPROVED,
        approvedBy: adminUserId,
        approvedAt: new Date(),
      },
    },
    { new: true }
  ).lean();
}

async function rejectShop(shopId) {
  const CTX = "db.rejectShop";
  logger.debug(CTX, "Rejecting shop", { shopId });
  return await Shop.findByIdAndUpdate(
    shopId,
    {
      $set: {
        status: SHOP_STATUS.REJECTED,
        isLive: false,
      },
    },
    { new: true }
  ).lean();
}

async function updateShopLiveStatus(shopId, isLive) {
  const CTX = "db.updateShopLiveStatus";
  logger.debug(CTX, "Updating shop live status", { shopId, isLive });
  return await Shop.findByIdAndUpdate(
    shopId,
    { $set: { isLive } },
    { new: true }
  ).lean();
}

async function countVendorShops(vendorId) {
  const CTX = "db.countVendorShops";
  logger.debug(CTX, "Counting shops for vendor", { vendorId });
  return await Shop.countDocuments({ vendorId });
}



// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION PLAN OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function createSubscriptionPlan(planData) {
  const CTX = "db.createSubscriptionPlan";
  logger.debug(CTX, "Creating subscription plan", { name: planData.name });
  const plan = new SubscriptionPlan(planData);
  return await plan.save();
}

async function getActiveSubscriptionPlans() {
  const CTX = "db.getActiveSubscriptionPlans";
  logger.debug(CTX, "Fetching all active subscription plans");
  return await SubscriptionPlan.find({ isActive: true })
    .sort({ price: 1 })
    .lean();
}

async function findSubscriptionPlanById(planId) {
  const CTX = "db.findSubscriptionPlanById";
  logger.debug(CTX, "Finding subscription plan by id", { planId });
  return await SubscriptionPlan.findById(planId).lean();
}


// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function createSubscription(subscriptionData) {
  const CTX = "db.createSubscription";
  logger.debug(CTX, "Creating subscription", {
    vendorId: subscriptionData.vendorId,
    planId: subscriptionData.subscriptionPlanId,
  });
  const subscription = new Subscription(subscriptionData);
  return await subscription.save();
}

async function findActiveSubscriptionByVendorId(vendorId) {
  const CTX = "db.findActiveSubscriptionByVendorId";
  logger.debug(CTX, "Finding active subscription for vendor", { vendorId });
  return await Subscription.findOne({
    vendorId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gt: new Date() },
  })
    .populate("subscriptionPlanId", "name maxShops durationInDays price")
    .lean();
}

async function expireSubscription(subscriptionId) {
  const CTX = "db.expireSubscription";
  logger.debug(CTX, "Expiring subscription", { subscriptionId });
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } },
    { new: true }
  ).lean();
}

async function hasActiveSubscription(vendorId) {
  const CTX = "db.hasActiveSubscription";
  logger.debug(CTX, "Checking active subscription for vendor", { vendorId });
  const count = await Subscription.countDocuments({
    vendorId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gt: new Date() },
  });
  return count > 0;
}


// createUser Utitlity finction

async function createAdminVendorUser(userObj) {
  const CTX = "db.createAdminVendorUser";
  logger.debug(CTX, "Creating admin-created vendor user", {
    email: userObj.email,
  });
  const user = new User(userObj);
  return await user.save();
}

async function clearMustResetPassword(userId) {
  const CTX = "db.clearMustResetPassword";
  logger.debug(CTX, "Clearing mustResetPassword flag", { userId });
  return await User.findByIdAndUpdate(
    userId,
    { $set: { mustResetPassword: false } },
    { new: true }
  ).lean();
}


module.exports = {
  // User
  findUserByEmail,
  findUserById,
  findUserByEmailOrPhone,
  createUser,
  markUserVerified,
  // OTP
  deleteOtpsByUserId,
  createOtpRecord,
  findLatestActiveOtpByUserId,
  incrementOtpAttempts,
  markOtpAsUsed,
  invalidateAllOtpsByUserId,
  // Session
  findActiveSessionByDevice,
  revokeSessionById,
  countActiveSessionsByUserId,
  findOldestActiveSessionByUserId,
  createSession,
  // Login helpers
  incrementFailedLoginAttempts,
  lockUserAccount,
  recordSuccessfulLogin,
  // reset password
  countRecentOtpsByUserId,
  markOtpVerified,
  findVerifiedUnusedOtpByUserId,
  updateUserPassword,
  // logout by token
  revokeAllSessionsByUserId,
  findActiveSessionsByUserId,

  // vendor
  createVendorProfile,
  findVendorByUserId,
  findVendorById,
  approveVendor,
  rejectVendor,
  suspendVendor,

  // shop
  createShop,
  findShopById,
  findShopsByVendorId,
  approveShop,
  rejectShop,
  updateShopLiveStatus,
  countVendorShops,

  // subscription plan
  createSubscriptionPlan,
  getActiveSubscriptionPlans,
  findSubscriptionPlanById,

  // subscription
  createSubscription,
  findActiveSubscriptionByVendorId,
  expireSubscription,
  hasActiveSubscription,

  // utility
  createAdminVendorUser,
  clearMustResetPassword,
};