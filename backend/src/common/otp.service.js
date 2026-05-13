/**
 * otp-utils.js — OTP generation, hashing, and comparison helpers.
 * Keeps crypto logic out of controllers and db-operations.
 */

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { OTP_CONFIG } = require("./shared");
const logger = require("./logger");

const CTX = "otpUtils";
const BCRYPT_ROUNDS = 10;

/**
 * Generates a cryptographically random numeric OTP of OTP_CONFIG.LENGTH digits.
 * Uses crypto.randomInt for uniform distribution (no modulo bias).
 * @returns {string} Zero-padded OTP string e.g. "047821"
 */
function generateOtp() {
  const max = Math.pow(10, OTP_CONFIG.LENGTH); // 1_000_000 for 6 digits
  const otp = crypto.randomInt(0, max);
  const otpStr = String(otp).padStart(OTP_CONFIG.LENGTH, "0");

  logger.debug(CTX, "Generated OTP", {
    // Only log in non-production environments for debugging
    otp: process.env.NODE_ENV !== "production" ? otpStr : "[REDACTED]",
  });

  return otpStr;
}

/**
 * Hashes a plain-text OTP with bcrypt.
 * @param {string} otp - Plain-text OTP
 * @returns {Promise<string>} bcrypt hash
 */
async function hashOtp(otp) {
  logger.debug(CTX, "Hashing OTP with bcrypt");
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

/**
 * Compares a plain-text OTP against a stored bcrypt hash.
 * @param {string} plainOtp - The OTP submitted by the user
 * @param {string} hashedOtp - The stored hash from the DB
 * @returns {Promise<boolean>}
 */
async function verifyOtp(plainOtp, hashedOtp) {
  logger.debug(CTX, "Comparing OTP against stored hash");
  return bcrypt.compare(plainOtp, hashedOtp);
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp,
};