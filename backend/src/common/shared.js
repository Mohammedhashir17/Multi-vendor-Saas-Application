
const logger = require("./logger");

// ─── Response Builders ────────────────────────────────────────────────────────

/**
 * Sends a standardised success JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Object} [data={}]
 */
function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * Sends a standardised error JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Object} [errors={}]
 */
function sendError(res, statusCode, message, errors = {}) {
  return res.status(statusCode).json({ success: false, message, errors });
}

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// ─── Role Constants ───────────────────────────────────────────────────────────

const ROLES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
  ADMIN: "admin",
};

const ALLOWED_ROLES = Object.values(ROLES);

// ─── OTP Config ───────────────────────────────────────────────────────────────

const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
};

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * Validates email format using a standard RFC-5322-lite regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
}

/**
 * Validates phone number: numeric only, 10–15 digits.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(String(phone));
}

/**
 * Validates password strength: minimum 6 characters.
 * Extend this for production (uppercase, symbol, etc.)
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

// ─── Global Async Error Wrapper ───────────────────────────────────────────────

/**
 * Wraps an async route handler to catch errors and forward to Express error middleware.
 * Eliminates repetitive try/catch in every controller.
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function}
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error("asyncHandler", "Unhandled async error caught", {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
      next(err);
    });
  };
}

module.exports = {
  sendSuccess,
  sendError,
  HTTP,
  ROLES,
  ALLOWED_ROLES,
  OTP_CONFIG,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  asyncHandler,
};