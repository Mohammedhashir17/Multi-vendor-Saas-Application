const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError, HTTP, OTP_CONFIG, isValidEmail, isValidPhone, isValidPassword } = require("../common/shared");
const logger = require("../common/logger");
// const { sendOtpEmail } = require("../common/email.service");
const { emailService } = require("../common/email.service");
const { generateOtp, hashOtp, verifyOtp } = require("../common/otp.service");
const db = require("../db/db.operations");
const OTP = require("../db/otp.model");

// ── Constants ─────────────────────────────────────────────────────────────
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS, 10) || 5;
const LOCK_DURATION_MS    = parseInt(process.env.LOCK_DURATION_MS, 10)    || 15 * 60 * 1000;
const MAX_DEVICES         = parseInt(process.env.MAX_DEVICES, 10)         || 5;
const ACCESS_TOKEN_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const COOKIE_SECURE        = process.env.NODE_ENV === "production";
 
const MAX_OTP_ATTEMPTS = 5;
const FORGOT_PASSWORD_RATE_LIMIT = 3;          
const FORGOT_PASSWORD_WINDOW_MS = 10 * 60 * 1000; 
 


function getRequestMeta(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.ip || req.connection?.remoteAddress;

  return {
    ip,
    requestId: req.requestId || crypto.randomBytes(4).toString("hex"),
  };
}

function deriveDevice(req) {
  const ua = req.headers["user-agent"] || "";

  if (!ua) return "Unknown Device";

  if (/postman/i.test(ua)) return "Postman";
  if (/insomnia/i.test(ua)) return "Insomnia";
  if (/curl/i.test(ua)) return "cURL";

  let os = "Unknown OS";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/iphone/i.test(ua)) os = "iPhone";
  else if (/ipad/i.test(ua)) os = "iPad";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";

  return `${browser} on ${os}`;
}

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP HANDLER
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────────────────────

async function signupHandler(req, res) {
  const CTX = "authController.signupHandler";
  const { username, email, phoneNumber, password, role } = req.validatedBody;
  const reqMeta = getRequestMeta(req);

  logger.info(CTX, "Signup attempt started", {
    email,
    phoneNumber,
    role,
    ...reqMeta,
  });

  // ── Duplicate user check (email OR phone) ───────────────────────────────────
  logger.debug(CTX, "Checking for existing user by email or phone", {
    email, phoneNumber, ...reqMeta,
  });

  const existingUser = await db.findUserByEmailOrPhone(email, phoneNumber);

  if (existingUser) {
    const conflictField =
      existingUser.email === email ? "email" : "phone number";

    logger.notice(CTX, "Signup rejected — duplicate user", {
      conflictField,
      email,
      phoneNumber,
      existingUserId: existingUser._id,
      ...reqMeta,
    });

    return sendError(
      res,
      HTTP.CONFLICT,
      `An account with this ${conflictField} already exists.`
    );
  }

  // ── Hash password ───────────────────────────────────────────────────────────
  logger.debug(CTX, "Hashing password", { email, ...reqMeta });
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // ── Create user (isVerified = false) ────────────────────────────────────────
  const newUser = await db.createUser({
    username,
    email,
    phoneNumber,
    password: passwordHash,
    role,
    isVerified: false,
  });

  logger.info(CTX, "User document created in DB", {
    userId: newUser._id,
    email,
    role,
    ...reqMeta,
  });

  // ── Delete any pre-existing OTPs ────────────────────────────────────────────
  const deleted = await db.deleteOtpsByUserId(newUser._id);
  logger.debug(CTX, "Cleared stale OTP records", {
    userId: newUser._id,
    deletedCount: deleted.deletedCount,
    ...reqMeta,
  });

  // ── Generate → Hash → Store OTP ────────────────────────────────────────────
  const plainOtp = generateOtp();
  logger.info(CTX, "OTP generated", { userId: newUser._id, email, ...reqMeta });

  const otpHash = await hashOtp(plainOtp);
  const expiresAt = OTP.generateExpiresAt();

  await db.createOtpRecord({
    userId: newUser._id,
    otpHash,
    expiresAt,
    attempts: 0,
    isUsed: false,
  });

  logger.info(CTX, "OTP record stored", {
    userId: newUser._id,
    email,
    expiresAt,
    expiryMinutes: OTP_CONFIG.EXPIRY_MINUTES,
    ...reqMeta,
  });

  // ── Send OTP email ──────────────────────────────────────────────────────────
  try {
    await emailService.sendOtpEmail({ toEmail: email, username, otp: plainOtp });

    logger.info(CTX, "OTP email dispatched successfully", {
      userId: newUser._id,
      email,
      ...reqMeta,
    });
  } catch (emailErr) {
    // User and OTP are created — they can still use resend-otp
    logger.error(CTX, "OTP email dispatch failed — user created, OTP stored", {
      userId: newUser._id,
      email,
      error: emailErr.message,
      ...reqMeta,
    });

    return sendSuccess(
      res,
      HTTP.CREATED,
      "Account created but OTP email failed. Please use resend OTP.",
      { userId: newUser._id, email }
    );
  }

  logger.info(CTX, "Signup flow completed successfully", {
    userId: newUser._id,
    email,
    ...reqMeta,
  });

  return sendSuccess(
    res,
    HTTP.CREATED,
    "Account created. Please check your email for the OTP.",
    { userId: newUser._id, email }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP HANDLER
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────

async function verifyOtpHandler(req, res) {
  const CTX = "authController.verifyOtpHandler";
  const { email, otp } = req.validatedBody;
  const reqMeta = getRequestMeta(req);

  logger.info(CTX, "OTP verification attempt", { email, ...reqMeta });

  // ── Fetch user ──────────────────────────────────────────────────────────────
  const user = await db.findUserByEmail(email);

  if (!user) {
    logger.notice(CTX, "Verification failed — user not found", {
      email, ...reqMeta,
    });
    // Generic message — do not reveal whether email exists
    return sendError(res, HTTP.BAD_REQUEST, "Invalid email or OTP.");
  }

  logger.debug(CTX, "User found for OTP verification", {
    userId: user._id, email, isVerified: user.isVerified, ...reqMeta,
  });

  // ── Already verified? ───────────────────────────────────────────────────────
  if (user.isVerified) {
    logger.notice(CTX, "Verification skipped — already verified", {
      userId: user._id, email, ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "This account is already verified.");
  }

  // ── Fetch latest active OTP ─────────────────────────────────────────────────
  const otpRecord = await db.findLatestActiveOtpByUserId(user._id);

  if (!otpRecord) {
    logger.notice(CTX, "Verification failed — no active OTP found", {
      userId: user._id, email, ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "No active OTP found. Please request a new one.");
  }

  // ── Brute-force guard ───────────────────────────────────────────────────────
  if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    logger.notice(CTX, "Verification blocked — max attempts exceeded", {
      userId: user._id,
      email,
      attempts: otpRecord.attempts,
      maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
      otpId: otpRecord._id,
      ...reqMeta,
    });
    return sendError(
      res,
      HTTP.TOO_MANY_REQUESTS,
      "Too many failed attempts. Please request a new OTP."
    );
  }

  // ── Expiry check ────────────────────────────────────────────────────────────
  if (otpRecord.expiresAt < new Date()) {
    logger.notice(CTX, "Verification failed — OTP expired", {
      userId: user._id,
      email,
      expiresAt: otpRecord.expiresAt,
      otpId: otpRecord._id,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "OTP has expired. Please request a new one.");
  }

  // ── OTP comparison ──────────────────────────────────────────────────────────
  logger.debug(CTX, "Comparing OTP hash", {
    userId: user._id, email, otpId: otpRecord._id, ...reqMeta,
  });

  const isMatch = await verifyOtp(otp, otpRecord.otpHash);

  if (!isMatch) {
    const updated = await db.incrementOtpAttempts(otpRecord._id);
    const remaining = OTP_CONFIG.MAX_ATTEMPTS - updated.attempts;

    logger.notice(CTX, "OTP mismatch — attempt incremented", {
      userId: user._id,
      email,
      otpId: otpRecord._id,
      attempts: updated.attempts,
      remainingAttempts: remaining,
      ...reqMeta,
    });

    return sendError(
      res,
      HTTP.BAD_REQUEST,
      `Invalid OTP. ${remaining} attempt(s) remaining.`
    );
  }

  // ── Success: mark user verified + consume OTP ───────────────────────────────
  await db.markUserVerified(user._id);
  await db.markOtpAsUsed(otpRecord._id);

  logger.info(CTX, "OTP verified — user marked as verified", {
    userId: user._id,
    email,
    otpId: otpRecord._id,
    ...reqMeta,
  });

  return sendSuccess(res, HTTP.OK, "Email verified successfully. You can now log in.", {
    userId: user._id,
    email,
    isVerified: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEND OTP HANDLER
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────

async function resendOtpHandler(req, res) {
  const CTX = "authController.resendOtpHandler";
  const { email } = req.validatedBody;
  const reqMeta = getRequestMeta(req);

  logger.info(CTX, "Resend OTP request received", { email, ...reqMeta });

  // ── Generic guard — do not reveal user existence ────────────────────────────
  const GENERIC_MSG =
    "If this email is registered and unverified, a new OTP has been sent.";

  const user = await db.findUserByEmail(email);

  if (!user) {
    logger.notice(CTX, "Resend — user not found, returning generic response", {
      email, ...reqMeta,
    });
    return sendSuccess(res, HTTP.OK, GENERIC_MSG);
  }

  if (user.isVerified) {
    logger.notice(CTX, "Resend — user already verified, returning generic response", {
      userId: user._id, email, ...reqMeta,
    });
    return sendSuccess(res, HTTP.OK, GENERIC_MSG);
  }

  // ── Cooldown check ──────────────────────────────────────────────────────────
  const latestOtp = await db.findLatestActiveOtpByUserId(user._id);

  if (latestOtp) {
    const secondsSinceLast =
      (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000;

    if (secondsSinceLast < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SECONDS - secondsSinceLast);

      logger.notice(CTX, "Resend blocked — cooldown active", {
        userId: user._id,
        email,
        secondsSinceLast: Math.floor(secondsSinceLast),
        waitSeconds,
        ...reqMeta,
      });

      return sendError(
        res,
        HTTP.TOO_MANY_REQUESTS,
        `Please wait ${waitSeconds} second(s) before requesting a new OTP.`
      );
    }
  }

  // ── Invalidate old OTPs → generate new one ──────────────────────────────────
  await db.invalidateAllOtpsByUserId(user._id);
  logger.debug(CTX, "Old OTPs invalidated", { userId: user._id, email, ...reqMeta });

  const plainOtp = generateOtp();
  const otpHash = await hashOtp(plainOtp);
  const expiresAt = OTP.generateExpiresAt();

  await db.createOtpRecord({
    userId: user._id,
    otpHash,
    expiresAt,
    attempts: 0,
    isUsed: false,
  });

  logger.info(CTX, "New OTP generated and stored", {
    userId: user._id, email, expiresAt, ...reqMeta,
  });

  // ── Send email ───────────────────────────────────────────────────────────────
  try {
    await emailService.sendOtpEmail({ toEmail: email, username: user.username, otp: plainOtp });

    logger.info(CTX, "Resend OTP email dispatched", {
      userId: user._id, email, ...reqMeta,
    });
  } catch (emailErr) {
    logger.error(CTX, "Resend OTP email dispatch failed", {
      userId: user._id,
      email,
      error: emailErr.message,
      ...reqMeta,
    });

    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to send OTP email. Please try again shortly."
    );
  }

  return sendSuccess(res, HTTP.OK, GENERIC_MSG);
}


// Login Handler Functionality
// POST /api/auth/login

// ── Handler ───────────────────────────────────────────────────────────────
async function loginHandler(req, res) {
  const CTX = "loginController.loginHandler";
  const { identifier, password } = req.validatedBody;
  const reqMeta = getRequestMeta(req);
  const device  = deriveDevice(req);

  // Resolve identifier → email or phone
  const isEmail = isValidEmail(identifier);
  const isPhone = isValidPhone(identifier);

  if (!isEmail && !isPhone) {
    logger.notice(CTX, "Login failed — invalid identifier format", { identifier, ...reqMeta });
    return sendError(res, HTTP.BAD_REQUEST, "Provide a valid email address or phone number");
  }

  const lookupField = isEmail
    ? { email: identifier.toLowerCase() }
    : { phoneNumber: identifier };

  logger.info(CTX, "Login attempt started", {
    identifier,
    loginMethod: isEmail ? "email" : "phone",
    device,
    ...reqMeta,
  });

  // ── 1. Find user ─────────────────────────────────────────────────────────
  const user = await db.findUserByEmailOrPhone(
    isEmail ? identifier.toLowerCase() : null,
    isPhone ? identifier : null
  );

  if (!user) {
    logger.notice(CTX, "Login failed — user not found", { identifier, ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "Invalid credentials");
  }

  const userId = user._id.toString();
  const email  = user.email; // use stored email for all subsequent logs

  // ── 2. Account status check ──────────────────────────────────────────────
  if (user.accountStatus && user.accountStatus !== "active") {
    logger.notice(CTX, "Login failed — account not active", {
      userId, email, accountStatus: user.accountStatus, ...reqMeta,
    });
    return sendError(res, HTTP.FORBIDDEN, "Account is not accessible");
  }

  // ── 3. Email verified check ──────────────────────────────────────────────
  if (!user.isVerified) {
    logger.notice(CTX, "Login failed — email not verified", { userId, email, ...reqMeta });
    return sendError(
      res, HTTP.FORBIDDEN,
      "Email not verified. Please verify your email before logging in."
    );
  }

  // ── 4. Account lock check ────────────────────────────────────────────────
  if (user.lockUntil && user.lockUntil > new Date()) {
    const cooldownSeconds = Math.ceil((user.lockUntil - Date.now()) / 1000);
    logger.notice(CTX, "Login failed — account locked", {
      userId, email, lockUntil: user.lockUntil, cooldownSeconds, ...reqMeta,
    });
    return sendError(
      res, HTTP.TOO_MANY_REQUESTS,
      `Account temporarily locked. Try again in ${cooldownSeconds} seconds.`
    );
  }

  // ── 5. Password comparison ───────────────────────────────────────────────
  logger.debug(CTX, "Comparing password", { userId, ...reqMeta });
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const updated  = await db.incrementFailedLoginAttempts(userId);
    const attempts = updated.failedLoginAttempts;

    logger.notice(CTX, "Login failed — wrong password", {
      userId, email, failedLoginAttempts: attempts, ...reqMeta,
    });

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await db.lockUserAccount(userId, lockUntil);
      logger.notice(CTX, "Account locked due to max failed attempts", {
        userId, email, lockUntil, ...reqMeta,
      });
      return sendError(
        res, HTTP.TOO_MANY_REQUESTS,
        `Too many failed attempts. Account locked for ${LOCK_DURATION_MS / 60000} minutes.`
      );
    }

    const remaining = MAX_FAILED_ATTEMPTS - attempts;
    return sendError(
      res, HTTP.UNAUTHORIZED,
      `Invalid credentials. ${remaining} attempt(s) remaining before lockout.`
    );
  }

  // ── 6. Reset attempts + update lastLoginAt ───────────────────────────────
  await db.recordSuccessfulLogin(userId);
  logger.info(CTX, "Password verified — resetting failed attempts", { userId, email, ...reqMeta });

  // ── After password verified, before issuing tokens ───────────────────────────

  if (user.mustResetPassword) {
    logger.info(CTX, "Vendor must reset password before proceeding", {
      userId: user._id,
    });
    return sendSuccess(res, HTTP.OK, "Password reset required.", {
      mustResetPassword: true,
      userId: user._id,
      email: user.email,
    });
  }

  // ── Continue with normal token generation below ───────────────────────────────

  // ── 7. Generate tokens ───────────────────────────────────────────────────
  const tokenPayload = { sub: userId, role: user.role };
  const accessToken  = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  logger.debug(CTX, "Tokens generated", { userId, ...reqMeta });

  // ── 8. Hash refresh token ────────────────────────────────────────────────
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  logger.debug(CTX, "Refresh token hashed", { userId, ...reqMeta });

  // ── 9. Session rotation — revoke existing session on same device ─────────
  const existingSession = await db.findActiveSessionByDevice(userId, device);
  if (existingSession) {
    await db.revokeSessionById(existingSession._id);
    logger.info(CTX, "Existing session revoked for device rotation", {
      userId, email, device, oldSessionId: existingSession._id, ...reqMeta,
    });
  }

  // ── 10. Max device enforcement ───────────────────────────────────────────
  const activeSessionCount = await db.countActiveSessionsByUserId(userId);
  if (activeSessionCount >= MAX_DEVICES) {
    const oldest = await db.findOldestActiveSessionByUserId(userId);
    if (oldest) {
      await db.revokeSessionById(oldest._id);
      logger.info(CTX, "Oldest session evicted — max devices reached", {
        userId, email, evictedSessionId: oldest._id, device: oldest.device, ...reqMeta,
      });
    }
  }

  // ── 11. Create new session ───────────────────────────────────────────────
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session   = await db.createSession({
    userId,
    refreshTokenHash,
    device,
    ip: reqMeta.ip,
    expiresAt,
  });
  logger.info(CTX, "Session created", {
    userId, email, device, sessionId: session._id, ...reqMeta,
  });

  // ── 12. Set refresh token cookie ─────────────────────────────────────────
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info(CTX, "Login successful", { userId, email, device, ...reqMeta });

  return sendSuccess(res, HTTP.OK, "Login successful", {
    accessToken,
    user: {
      id: userId,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
}


// refresh token handler
// ── Refresh Token Handler ─────────────────────────────────────────────────
async function refreshHandler(req, res) {
  const CTX = "authController.refreshHandler";
  const reqMeta = getRequestMeta(req);
  const { refreshToken } = req.cookies;
  console.log("Received refresh token request",  refreshToken);

  // ── 1. Cookie present? ──────────────────────────────────────────────────
  if (!refreshToken) {
    logger.notice(CTX, "Refresh failed — no cookie", { ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "No refresh token provided");
  }

  // ── 2. Verify JWT signature + expiry ────────────────────────────────────
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    logger.notice(CTX, "Refresh failed — invalid token", {
      reason: err.name,
      ...reqMeta,
    });
    // Clear the dead cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return sendError(
      res,
      HTTP.UNAUTHORIZED,
      isExpired
        ? "Session expired. Please log in again."
        : "Invalid refresh token."
    );
  }

  const userId = payload.sub;
  const device = deriveDevice(req);

  // ── 3. Find active session in DB ────────────────────────────────────────
  const session = await db.findActiveSessionByDevice(userId, device);

  if (!session) {
    logger.notice(CTX, "Refresh failed — session not found or revoked", {
      userId,
      device,
      ...reqMeta,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return sendError(res, HTTP.UNAUTHORIZED, "Session not found. Please log in again.");
  }

  // ── 4. Compare refresh token hash ───────────────────────────────────────
  const tokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);

  if (!tokenValid) {
    // Token reuse attack — revoke the session immediately
    await db.revokeSessionById(session._id);
    logger.notice(CTX, "Refresh failed — token hash mismatch (possible reuse attack)", {
      userId,
      device,
      sessionId: session._id,
      ...reqMeta,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return sendError(res, HTTP.UNAUTHORIZED, "Invalid session. Please log in again.");
  }

  // ── 5. Generate new tokens ──────────────────────────────────────────────
  const tokenPayload = { sub: userId, role: payload.role };

  const newAccessToken  = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: "15m" });
  const newRefreshToken = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d"  });

  logger.debug(CTX, "New tokens generated", { userId, ...reqMeta });

  // ── 6. Hash new refresh token ───────────────────────────────────────────
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

  // ── 7. Rotate session — revoke old, create new ──────────────────────────
  await db.revokeSessionById(session._id);

  const newSession = await db.createSession({
    userId,
    refreshTokenHash: newRefreshTokenHash,
    device,
    ip: reqMeta.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  logger.info(CTX, "Token refreshed — session rotated", {
    userId,
    device,
    oldSessionId: session._id,
    newSessionId: newSession._id,
    ...reqMeta,
  });

  // ── 8. Set new refresh cookie + return new access token ─────────────────
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, HTTP.OK, "Token refreshed successfully", {
    accessToken: newAccessToken,
  });
}

// reset password handler


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/password/forgot
// Step 1: Validate email → rate-limit → find user → generate OTP → send email
// ─────────────────────────────────────────────────────────────────────────────
async function forgotPasswordHandler(req, res) {
  const CTX = "passwordController.forgotPasswordHandler";
  const { email } = req.validatedBody;      // validated + lowercased by Zod schema
  const reqMeta = getRequestMeta(req);
 
  logger.info(CTX, "Forgot-password request received", { email, ...reqMeta });
 
  // ── Find user (null-safe helper — pass null for phoneNumber) ──────────────
  const user = await db.findUserByEmailOrPhone(email, null);
 
  // ── Rate-limit check (runs even if user not found to prevent enumeration) ─
  // Count OTPs created within the window for this user (if they exist)
  if (user) {
    const recentOtpCount = await db.countRecentOtpsByUserId(
      user._id,
      FORGOT_PASSWORD_WINDOW_MS
    );
 
    if (recentOtpCount >= FORGOT_PASSWORD_RATE_LIMIT) {
      logger.notice(CTX, "Forgot-password rate limit exceeded", {
        userId: user._id,
        email,
        recentOtpCount,
        ...reqMeta,
      });
      return sendError(
        res,
        HTTP.TOO_MANY_REQUESTS,
        "Too many password reset requests. Please wait 10 minutes before trying again."
      );
    }
  }
 
  // ── Generic success returned regardless of whether user exists ────────────
  // This prevents email enumeration attacks.
  if (!user) {
    logger.notice(CTX, "Forgot-password: user not found (silent)", {
      email,
      ...reqMeta,
    });
    return sendSuccess(
      res,
      HTTP.OK,
      "If that email is registered, a reset OTP has been sent."
    );
  }
 
  // ── Invalidate any previous OTPs for this user ───────────────────────────
  await db.invalidateAllOtpsByUserId(user._id);
  logger.info(CTX, "Previous OTPs invalidated", { userId: user._id, email, ...reqMeta });
 
  // ── Generate & store new OTP ─────────────────────────────────────────────
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  // await db.createOtpRecord(user._id, otpHash);
  await db.createOtpRecord({
  userId: user._id,
  otpHash,
  expiresAt: OTP.generateExpiresAt(),
});
  logger.info(CTX, "Reset OTP generated and stored", { userId: user._id, email, ...reqMeta });
 
  // ── Send OTP email (non-fatal: log error but don't crash the request) ────
  try {
    await emailService.sendOtpEmail({ toEmail: email, username: user.username, otp });
    logger.info(CTX, "Reset OTP email sent", { userId: user._id, email, ...reqMeta });
  } catch (emailErr) {
    logger.error(CTX, "Failed to send reset OTP email", {
      userId: user._id,
      email,
      error: emailErr.message,
      ...reqMeta,
    });
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Could not send OTP email. Please try again shortly."
    );
  }
 
  return sendSuccess(
    res,
    HTTP.OK,
    "If that email is registered, a reset OTP has been sent."
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/password/verify-otp
// Step 2: Validate email + OTP → find OTP record → check expiry/attempts/match
//         → mark OTP verified (isUsed stays false until password is reset)
// ─────────────────────────────────────────────────────────────────────────────
async function verifyResetOtpHandler(req, res) {
  const CTX = "passwordController.verifyResetOtpHandler";
  const { email, otp } = req.validatedBody;
  const reqMeta = getRequestMeta(req);
 
  logger.info(CTX, "Verify-reset-OTP request received", { email, ...reqMeta });
 
  // ── Find user ─────────────────────────────────────────────────────────────
  const user = await db.findUserByEmailOrPhone(email, null);
  if (!user) {
    logger.notice(CTX, "Verify-reset-OTP: user not found", { email, ...reqMeta });
    return sendError(res, HTTP.BAD_REQUEST, "Invalid or expired OTP.");
  }
 
  // ── Find latest active OTP ────────────────────────────────────────────────
  const otpRecord = await db.findLatestActiveOtpByUserId(user._id);
  if (!otpRecord) {
    logger.notice(CTX, "Verify-reset-OTP: no active OTP found", {
      userId: user._id,
      email,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "Invalid or expired OTP.");
  }
 
  // ── Check expiry ──────────────────────────────────────────────────────────
  if (otpRecord.expiresAt < new Date()) {
    logger.notice(CTX, "Verify-reset-OTP: OTP expired", {
      userId: user._id,
      email,
      otpId: otpRecord._id,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "OTP has expired. Please request a new one.");
  }
 
  // ── Check attempt limit ───────────────────────────────────────────────────
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    logger.notice(CTX, "Verify-reset-OTP: max attempts reached", {
      userId: user._id,
      email,
      attempts: otpRecord.attempts,
      ...reqMeta,
    });
    return sendError(
      res,
      HTTP.TOO_MANY_REQUESTS,
      "Too many incorrect attempts. Please request a new OTP."
    );
  }
 
  // ── Verify OTP ────────────────────────────────────────────────────────────
  const isMatch = await verifyOtp(otp, otpRecord.otpHash);
  if (!isMatch) {
    await db.incrementOtpAttempts(otpRecord._id);
    logger.notice(CTX, "Verify-reset-OTP: incorrect OTP", {
      userId: user._id,
      email,
      attempts: otpRecord.attempts + 1,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "Incorrect OTP.");
  }
 
  // ── Mark OTP as verified (NOT as used — used only after password reset) ───
  // We re-use incrementOtpAttempts is not the right call here.
  // We mark verified by setting a flag via a new db helper.
  await db.markOtpVerified(otpRecord._id);
  logger.info(CTX, "Reset OTP verified successfully", {
    userId: user._id,
    email,
    otpId: otpRecord._id,
    ...reqMeta,
  });
 
  return sendSuccess(res, HTTP.OK, "OTP verified. You may now reset your password.");
}
 
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/password/reset
// Step 3: Validate email + OTP + newPassword
//         → re-verify OTP (must exist, be verified, not used)
//         → validate password strength
//         → hash & update password
//         → mark OTP as used
//         → revoke all active sessions
// ─────────────────────────────────────────────────────────────────────────────

async function resetPasswordHandler(req, res) {
  const CTX = "passwordController.resetPasswordHandler";
  const { email, otp, newPassword } = req.validatedBody;
  const reqMeta = getRequestMeta(req);

  logger.info(CTX, "Reset-password request received", { email, ...reqMeta });

  // ── Find user ─────────────────────────────────────────────────────────────
  const user = await db.findUserByEmailOrPhone(email, null);
  if (!user) {
    logger.notice(CTX, "Reset-password: user not found", { email, ...reqMeta });
    return sendError(res, HTTP.BAD_REQUEST, "Invalid request. Please restart the reset flow.");
  }

  // ── Validate password strength ────────────────────────────────────────────
  if (!isValidPassword(newPassword)) {
    logger.notice(CTX, "Reset-password: weak password rejected", {
      userId: user._id,
      email,
      ...reqMeta,
    });
    return sendError(
      res,
      HTTP.BAD_REQUEST,
      "Password does not meet strength requirements. Use at least 8 characters with uppercase, lowercase, a number, and a symbol."
    );
  }

  // ── Branch: admin-created vendor (no OTP required) ────────────────────────
  if (user.mustResetPassword) {
    logger.info(CTX, "Admin-created vendor reset — skipping OTP verification", {
      userId: user._id,
      email,
      ...reqMeta,
    });

    // ── Hash and update password ────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.updateUserPassword(user._id, passwordHash);
    logger.info(CTX, "Vendor password updated", { userId: user._id, email, ...reqMeta });

    // ── Clear mustResetPassword flag ────────────────────────────────────────
    await db.clearMustResetPassword(user._id);
    logger.info(CTX, "mustResetPassword cleared", { userId: user._id, email, ...reqMeta });

    // ── Revoke all sessions ─────────────────────────────────────────────────
    await db.revokeAllSessionsByUserId(user._id);
    logger.info(CTX, "All sessions revoked after vendor password reset", {
      userId: user._id,
      email,
      ...reqMeta,
    });

    return sendSuccess(
      res,
      HTTP.OK,
      "Password reset successfully. Please log in with your new password."
    );
  }

  // ── Branch: normal customer (full OTP verification required) ─────────────
  const otpRecord = await db.findVerifiedUnusedOtpByUserId(user._id);
  if (!otpRecord) {
    logger.notice(CTX, "Reset-password: no verified/unused OTP found", {
      userId: user._id,
      email,
      ...reqMeta,
    });
    return sendError(
      res,
      HTTP.BAD_REQUEST,
      "OTP verification required. Please verify your OTP before resetting the password."
    );
  }

  // ── Check OTP expiry ──────────────────────────────────────────────────────
  if (otpRecord.expiresAt < new Date()) {
    logger.notice(CTX, "Reset-password: verified OTP has since expired", {
      userId: user._id,
      email,
      otpId: otpRecord._id,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "OTP has expired. Please restart the reset flow.");
  }

  // ── Confirm OTP hash matches ──────────────────────────────────────────────
  const isMatch = await verifyOtp(otp, otpRecord.otpHash);
  if (!isMatch) {
    logger.notice(CTX, "Reset-password: OTP mismatch on final check", {
      userId: user._id,
      email,
      ...reqMeta,
    });
    return sendError(res, HTTP.BAD_REQUEST, "Invalid OTP. Please restart the reset flow.");
  }

  // ── Hash and update password ──────────────────────────────────────────────
  logger.debug(CTX, "Hashing new password", { userId: user._id, email, ...reqMeta });
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await db.updateUserPassword(user._id, passwordHash);
  logger.info(CTX, "User password updated", { userId: user._id, email, ...reqMeta });

  // ── Mark OTP as used ──────────────────────────────────────────────────────
  await db.markOtpAsUsed(otpRecord._id);
  logger.info(CTX, "Reset OTP marked as used", {
    userId: user._id,
    email,
    otpId: otpRecord._id,
    ...reqMeta,
  });

  // ── Clear mustResetPassword just in case ──────────────────────────────────
  await db.clearMustResetPassword(user._id);

  // ── Revoke all sessions ───────────────────────────────────────────────────
  await db.revokeAllSessionsByUserId(user._id);
  logger.info(CTX, "All sessions revoked after password reset", {
    userId: user._id,
    email,
    ...reqMeta,
  });

  return sendSuccess(
    res,
    HTTP.OK,
    "Password reset successfully. Please log in with your new password."
  );
}


// logout handler

// ─── LOGOUT (current device) ────────────────────────────────────────────────

async function logoutHandler(req, res) {
  const CTX = "authController.logoutHandler";
  const reqMeta = getRequestMeta(req);

  // 1. Verify access token
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!accessToken) {
    logger.notice(CTX, "Logout attempt with no access token", { ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "Access token required.");
  }

  console.log("ACCESS TOKEN",accessToken);
  
  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("DECODED VALUE", decoded);
    
  } catch (err) {
    logger.notice(CTX, "Logout attempt with invalid/expired access token", { ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "Invalid or expired access token.");
  }

  const userId = decoded.userId;

  // 2. Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    // No active session cookie — treat as already logged out
    logger.info(CTX, "Logout called with no refresh token cookie (already logged out)", {
      userId,
      ...reqMeta,
    });
    return sendSuccess(res, HTTP.OK, "No active session found.");
  }

  // 3. Hash refresh token and find matching session
  const activeSessions = await db.findActiveSessionsByUserId(userId);

  let matchedSession = null;
  for (const session of activeSessions) {
    const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (match) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    logger.info(CTX, "Logout: no matching active session found", { userId, ...reqMeta });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
    return sendSuccess(res, HTTP.OK, "Already logged out.");
  }

  // 4. Revoke the session
  await db.revokeSessionById(matchedSession._id);

  logger.info(CTX, "User logged out successfully", { userId, sessionId: matchedSession._id, ...reqMeta });

  // 5. Clear the refresh token cookie
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });

  return sendSuccess(res, HTTP.OK, "Logged out successfully.");
}

// ─── LOGOUT ALL (all devices) ───────────────────────────────────────────────

async function logoutAllHandler(req, res) {
  const CTX = "authController.logoutAllHandler";
  const reqMeta = getRequestMeta(req);

  // 1. Verify access token
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!accessToken) {
    logger.notice(CTX, "Logout-all attempt with no access token", { ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "Access token required.");
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    logger.notice(CTX, "Logout-all attempt with invalid/expired access token", { ...reqMeta });
    return sendError(res, HTTP.UNAUTHORIZED, "Invalid or expired access token.");
  }

  const userId = decoded.userId;

  // 2. Revoke all active sessions
  const revokedCount = await db.revokeAllSessionsByUserId(userId);

  if (revokedCount === 0) {
    logger.info(CTX, "Logout-all: no active sessions found", { userId, ...reqMeta });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
    return sendSuccess(res, HTTP.OK, "No active sessions found.");
  }

  logger.info(CTX, "User logged out from all devices", {
    userId,
    revokedCount,
    ...reqMeta,
  });

  // 3. Clear the refresh token cookie
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });

  return sendSuccess(res, HTTP.OK, `Logged out from all ${revokedCount} device(s) successfully.`);
}
 

module.exports = {
  signupHandler,
  verifyOtpHandler,
  resendOtpHandler,
  loginHandler,
  refreshHandler,   // ← add this
  forgotPasswordHandler,
  verifyResetOtpHandler,
  resetPasswordHandler,
  logoutHandler,
  logoutAllHandler
};
