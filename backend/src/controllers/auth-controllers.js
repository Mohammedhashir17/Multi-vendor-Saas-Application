import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import * as logger from '../common/logger.js';
import { toPublicUser } from '../common/shared.js';
import {
  findUserByEmail,
  findUserByEmailOrMobile,
  findUserByGoogleSub,
  findUserByMobileNormalized,
  normalizeMobile,
  createUser,
} from '../db/user-repository.js';

const moduleName = 'auth-controllers';

let googleClient = null;
function getGoogleClient() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) return null;
  if (!googleClient) googleClient = new OAuth2Client(id);
  return googleClient;
}

function signToken(userDoc) {
  logger.debug(moduleName, 'signToken: read JWT_SECRET / build payload');
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  const u = toPublicUser(userDoc);
  logger.debug(moduleName, 'signToken: jwt.sign');
  return jwt.sign(
    { sub: u.id, email: u.email, role: userDoc.role || 'customer' },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function buildVendorTrialEndDate() {
  const vendorTrialEndsAt = new Date();
  vendorTrialEndsAt.setDate(vendorTrialEndsAt.getDate() + Number(process.env.VENDOR_TRIAL_DAYS || 14));
  return vendorTrialEndsAt;
}

async function issueOtpHash() {
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 10);
  return { otp, otpHash };
}

function registrationOtpExpiryDate() {
  return new Date(Date.now() + Number(process.env.REGISTRATION_OTP_TTL_MS || 900000));
}

function maybeLogRegistrationOtp(email, otp) {
  if (String(process.env.LOG_REGISTER_OTP).toLowerCase() === 'true') {
    logger.notice(moduleName, `registerRouteHandler: dev OTP for ${email}: ${otp}`);
  }
}

export const loginRouteHandler = async (req, res, emailOrMobile, password) => {
  try {
    const idHint = String(emailOrMobile || '').includes('@') ? emailOrMobile : '[mobile]';
    logger.debug(moduleName, 'loginRouteHandler: enter', { identifier: idHint });
    logger.debug(moduleName, 'loginRouteHandler: findUserByEmailOrMobile');
    const user = await findUserByEmailOrMobile(emailOrMobile);
    if (!user) {
      logger.notice(moduleName, 'loginRouteHandler: exit http=401', { reason: 'invalid_credentials' });
      return res.status(401).json({ status: 'failure', message: 'Invalid email, mobile, or password' });
    }

    if (user.authProvider === 'local' && user.isVerified === false) {
      logger.notice(moduleName, 'loginRouteHandler: exit http=403', { reason: 'email_not_verified' });
      return res.status(403).json({
        status: 'failure',
        message: 'Please verify your email with the OTP before signing in',
      });
    }

    if (!user.passwordHash) {
      logger.notice(moduleName, 'loginRouteHandler: exit http=401', { reason: 'google_only_account' });
      return res.status(401).json({
        status: 'failure',
        message: 'This account uses Google sign-in. Please use “Login with Google”.',
      });
    }

    logger.debug(moduleName, 'loginRouteHandler: bcrypt.compare');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      logger.notice(moduleName, 'loginRouteHandler: exit http=401', { reason: 'invalid_credentials' });
      return res.status(401).json({ status: 'failure', message: 'Invalid email, mobile, or password' });
    }

    logger.debug(moduleName, 'loginRouteHandler: signToken + respond');
    const token = signToken(user);
    logger.info(moduleName, 'loginRouteHandler: exit http=200', { userId: user._id?.toString() });
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { user: toPublicUser(user), token },
    });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `loginRouteHandler: ${errorMessage}`, String(emailOrMobile || '').includes('@') ? emailOrMobile : undefined);
    logger.debug(moduleName, 'loginRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({
      status: 'failure',
      message: 'An error occurred while logging in',
    });
  }
};

export const registerRouteHandler = async (req, res, { email, password, confirmPassword, name, role, businessName, mobile }) => {
  try {
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const mobileNorm = normalizeMobile(mobile);
    logger.debug(moduleName, 'registerRouteHandler: enter', { email: normalizedEmail, name, role, businessName, mobileLen: mobileNorm.length });
    if (!normalizedEmail || !password) {
      logger.notice(moduleName, 'registerRouteHandler: exit http=400', { reason: 'missing_email_or_password' });
      return res.status(400).json({ status: 'failure', message: 'Email and password are required' });
    }
    if (confirmPassword === undefined || confirmPassword === null || String(confirmPassword) === '') {
      logger.notice(moduleName, 'registerRouteHandler: exit http=400', { reason: 'confirm_password_required' });
      return res.status(400).json({ status: 'failure', message: 'Confirm password is required' });
    }
    if (password !== confirmPassword) {
      logger.notice(moduleName, 'registerRouteHandler: exit http=400', { reason: 'password_mismatch' });
      return res.status(400).json({ status: 'failure', message: 'Password and confirm password do not match' });
    }
    if (mobileNorm.length < 10) {
      logger.notice(moduleName, 'registerRouteHandler: exit http=400', { reason: 'invalid_mobile' });
      return res.status(400).json({ status: 'failure', message: 'Valid mobile number is required (at least 10 digits)' });
    }

    logger.debug(moduleName, 'registerRouteHandler: duplicate checks');
    const existingEmail = await findUserByEmail(normalizedEmail);
    const pendingEmailUser = existingEmail?.authProvider === 'local' && existingEmail?.isVerified === false ? existingEmail : null;
    if (existingEmail && !pendingEmailUser) {
      logger.notice(moduleName, 'registerRouteHandler: exit http=409', { reason: 'email_exists' });
      return res.status(409).json({ status: 'failure', message: 'An account with this email already exists' });
    }
    const existingMobile = await findUserByMobileNormalized(mobileNorm);
    const mobileBelongsToPendingEmailUser = pendingEmailUser && existingMobile && String(existingMobile._id) === String(pendingEmailUser._id);
    if (existingMobile && !mobileBelongsToPendingEmailUser) {
      logger.notice(moduleName, 'registerRouteHandler: exit http=409', { reason: 'mobile_exists' });
      return res.status(409).json({ status: 'failure', message: 'An account with this mobile number already exists' });
    }

    logger.debug(moduleName, 'registerRouteHandler: resolve role + trial dates');
    let finalRole = 'customer';
    if (role === 'vendor') finalRole = 'vendor';
    if (role === 'admin') {
      logger.notice(moduleName, 'registerRouteHandler: exit http=403', { reason: 'admin_self_register' });
      return res.status(403).json({ status: 'failure', message: 'Cannot self-register as admin' });
    }

    const vendorTrialEndsAt = buildVendorTrialEndDate();

    logger.debug(moduleName, 'registerRouteHandler: bcrypt.hash + issue signup OTP');
    const passwordHash = await bcrypt.hash(password, 10);
    const { otp, otpHash } = await issueOtpHash();
    const otpExpiresAt = registrationOtpExpiryDate();
    const commonFields = {
      passwordHash,
      mobile: mobileNorm,
      name,
      role: finalRole,
      businessName: finalRole === 'vendor' ? businessName || name || '' : '',
      vendorTrialEndsAt: finalRole === 'vendor' ? vendorTrialEndsAt : undefined,
      authProvider: 'local',
      isVerified: false,
      registrationOtpHash: otpHash,
      registrationOtpExpiresAt: otpExpiresAt,
    };

    let user = pendingEmailUser;
    if (user) {
      Object.assign(user, commonFields);
      await user.save();
    } else {
      user = await createUser({
        email: normalizedEmail,
        ...commonFields,
      });
    }

    maybeLogRegistrationOtp(normalizedEmail, otp);
    logger.info(moduleName, 'registerRouteHandler: exit http=202', { userId: user._id?.toString(), role: finalRole });
    return res.status(202).json({
      status: 'success',
      message:
        'Verification code issued. Enter the OTP to finish creating your account. (In local development, set LOG_REGISTER_OTP=true on the API to print the code in the terminal.)',
      data: { email: normalizedEmail },
    });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `registerRouteHandler: ${errorMessage}`, email);
    logger.debug(moduleName, 'registerRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({
      status: 'failure',
      message: 'An error occurred while registering',
    });
  }
};

export const verifyRegistrationOtpRouteHandler = async (req, res, { email, otp }) => {
  try {
    const normalized = String(email || '').toLowerCase().trim();
    logger.debug(moduleName, 'verifyRegistrationOtpRouteHandler: enter', { email: normalized });
    if (!normalized || !String(otp || '').trim()) {
      return res.status(400).json({ status: 'failure', message: 'Email and verification code are required' });
    }

    const user = await findUserByEmail(normalized);
    if (!user || user.authProvider !== 'local' || user.isVerified !== false || !user.registrationOtpHash || !user.registrationOtpExpiresAt) {
      logger.notice(moduleName, 'verifyRegistrationOtpRouteHandler: no pending registration');
      return res.status(400).json({ status: 'failure', message: 'No pending registration found for this email' });
    }
    if (new Date(user.registrationOtpExpiresAt) < new Date()) {
      user.registrationOtpHash = undefined;
      user.registrationOtpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ status: 'failure', message: 'Code expired. Request a new one.' });
    }

    const ok = await bcrypt.compare(String(otp).trim(), user.registrationOtpHash);
    if (!ok) {
      logger.notice(moduleName, 'verifyRegistrationOtpRouteHandler: bad OTP');
      return res.status(400).json({ status: 'failure', message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.registrationOtpHash = undefined;
    user.registrationOtpExpiresAt = undefined;
    await user.save();

    const token = signToken(user);
    logger.info(moduleName, 'verifyRegistrationOtpRouteHandler: exit http=200', { userId: user._id?.toString() });
    return res.status(200).json({
      status: 'success',
      message: 'Registration successful',
      data: { user: toPublicUser(user), token },
    });
  } catch (err) {
    logger.error(moduleName, `verifyRegistrationOtpRouteHandler: ${err.message}`);
    return res.status(500).json({ status: 'failure', message: 'Could not verify registration code' });
  }
};

export const resendRegistrationOtpRouteHandler = async (req, res, { email }) => {
  try {
    const normalized = String(email || '').toLowerCase().trim();
    logger.debug(moduleName, 'resendRegistrationOtpRouteHandler: enter', { email: normalized });
    if (!normalized || !normalized.includes('@')) {
      return res.status(400).json({ status: 'failure', message: 'Valid email is required' });
    }

    const user = await findUserByEmail(normalized);
    if (!user || user.authProvider !== 'local' || user.isVerified !== false) {
      logger.notice(moduleName, 'resendRegistrationOtpRouteHandler: no pending registration');
      return res.status(400).json({ status: 'failure', message: 'No pending registration found for this email' });
    }

    const { otp, otpHash } = await issueOtpHash();
    user.registrationOtpHash = otpHash;
    user.registrationOtpExpiresAt = registrationOtpExpiryDate();
    await user.save();

    maybeLogRegistrationOtp(normalized, otp);
    logger.info(moduleName, 'resendRegistrationOtpRouteHandler: exit http=200', { userId: user._id?.toString() });
    return res.status(200).json({
      status: 'success',
      message:
        'A new verification code has been issued. (In local development, set LOG_REGISTER_OTP=true on the API to print the code in the terminal.)',
    });
  } catch (err) {
    logger.error(moduleName, `resendRegistrationOtpRouteHandler: ${err.message}`);
    return res.status(500).json({ status: 'failure', message: 'Could not resend verification code' });
  }
};

export const googleAuthRouteHandler = async (req, res, idToken) => {
  try {
    logger.debug(moduleName, 'googleAuthRouteHandler: enter');
    const client = getGoogleClient();
    if (!client || !process.env.GOOGLE_CLIENT_ID) {
      logger.notice(moduleName, 'googleAuthRouteHandler: exit http=503', { reason: 'google_not_configured' });
      return res.status(503).json({
        status: 'failure',
        message: 'Google sign-in is not configured on the server (set GOOGLE_CLIENT_ID)',
      });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      logger.notice(moduleName, 'googleAuthRouteHandler: exit http=401', { reason: 'invalid_token', error: verifyErr.message });
      return res.status(401).json({ status: 'failure', message: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    const sub = payload?.sub;
    const email = payload?.email?.toLowerCase()?.trim();
    const emailVerified = payload?.email_verified;
    const name = payload?.name || (email ? email.split('@')[0] : 'User');

    if (!sub || !email) {
      logger.notice(moduleName, 'googleAuthRouteHandler: exit http=400', { reason: 'missing_profile' });
      return res.status(400).json({ status: 'failure', message: 'Google account did not return email' });
    }
    if (emailVerified === false) {
      logger.notice(moduleName, 'googleAuthRouteHandler: exit http=403', { reason: 'email_not_verified' });
      return res.status(403).json({ status: 'failure', message: 'Please verify your email with Google first' });
    }

    let user = await findUserByGoogleSub(sub);
    if (!user) {
      user = await findUserByEmail(email);
      if (user) {
        user.googleSub = sub;
        await user.save();
        logger.debug(moduleName, 'googleAuthRouteHandler: linked Google to existing email user');
      }
    }

    if (!user) {
      user = await createUser({
        email,
        passwordHash: '',
        name,
        role: 'customer',
        businessName: '',
        authProvider: 'google',
        googleSub: sub,
      });
      logger.debug(moduleName, 'googleAuthRouteHandler: created new Google user');
    }

    const token = signToken(user);
    logger.info(moduleName, 'googleAuthRouteHandler: exit http=200', { userId: user._id?.toString() });
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { user: toPublicUser(user), token },
    });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `googleAuthRouteHandler: ${errorMessage}`);
    logger.debug(moduleName, 'googleAuthRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({
      status: 'failure',
      message: 'An error occurred',
    });
  }
};

export const requestPasswordResetOtpRouteHandler = async (req, res, email) => {
  try {
    const normalized = String(email || '').toLowerCase().trim();
    logger.debug(moduleName, 'requestPasswordResetOtpRouteHandler: enter', { email: normalized });
    const user = normalized ? await findUserByEmail(normalized) : null;
    if (user?.passwordHash) {
      const otp = String(crypto.randomInt(100000, 1000000));
      const otpHash = await bcrypt.hash(otp, 10);
      user.passwordResetOtpHash = otpHash;
      const ttlMs = Number(process.env.PASSWORD_RESET_OTP_TTL_MS || 900000);
      user.passwordResetOtpExpiresAt = new Date(Date.now() + ttlMs);
      await user.save();
      if (String(process.env.LOG_RESET_OTP).toLowerCase() === 'true') {
        logger.notice(moduleName, `requestPasswordResetOtpRouteHandler: dev OTP for ${normalized}: ${otp}`);
      }
      logger.info(moduleName, 'requestPasswordResetOtpRouteHandler: OTP issued', { userId: user._id?.toString() });
    } else if (user && !user.passwordHash) {
      logger.debug(moduleName, 'requestPasswordResetOtpRouteHandler: google-only account — skip OTP');
    } else {
      logger.debug(moduleName, 'requestPasswordResetOtpRouteHandler: unknown email — generic response');
    }
    return res.status(200).json({
      status: 'success',
      message:
        'If an account with a password exists for this email, a verification code has been issued. (Connect email/SMS in production; set LOG_RESET_OTP=true locally to print the code in server logs.)',
    });
  } catch (err) {
    logger.error(moduleName, `requestPasswordResetOtpRouteHandler: ${err.message}`);
    return res.status(500).json({ status: 'failure', message: 'Could not send verification code' });
  }
};

export const confirmPasswordResetRouteHandler = async (req, res, { email, otp, newPassword, confirmPassword }) => {
  try {
    const normalized = String(email || '').toLowerCase().trim();
    logger.debug(moduleName, 'confirmPasswordResetRouteHandler: enter', { email: normalized });
    if (!normalized || !String(otp || '').trim()) {
      return res.status(400).json({ status: 'failure', message: 'Email and verification code are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'failure', message: 'Passwords do not match' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ status: 'failure', message: 'Password must be at least 6 characters' });
    }
    const user = await findUserByEmail(normalized);
    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      logger.notice(moduleName, 'confirmPasswordResetRouteHandler: invalid or missing reset state');
      return res.status(400).json({ status: 'failure', message: 'Invalid or expired code. Request a new one.' });
    }
    if (new Date(user.passwordResetOtpExpiresAt) < new Date()) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ status: 'failure', message: 'Code expired. Request a new one.' });
    }
    const ok = await bcrypt.compare(String(otp).trim(), user.passwordResetOtpHash);
    if (!ok) {
      logger.notice(moduleName, 'confirmPasswordResetRouteHandler: bad OTP');
      return res.status(400).json({ status: 'failure', message: 'Invalid verification code' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    await user.save();
    logger.info(moduleName, 'confirmPasswordResetRouteHandler: password updated', { userId: user._id?.toString() });
    return res.status(200).json({ status: 'success', message: 'Password updated. You can sign in now.' });
  } catch (err) {
    logger.error(moduleName, `confirmPasswordResetRouteHandler: ${err.message}`);
    return res.status(500).json({ status: 'failure', message: 'Could not reset password' });
  }
};

export const logoutRouteHandler = async (req, res) => {
  try {
    logger.debug(moduleName, 'logoutRouteHandler: enter');
    logger.info(moduleName, 'logoutRouteHandler: exit http=200', { note: 'client_discards_token' });
    return res.status(200).json({ status: 'success', message: 'Logged out (client should discard token)' });
  } catch (err) {
    const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    logger.error(moduleName, `logoutRouteHandler: ${errorMessage}`);
    logger.debug(moduleName, 'logoutRouteHandler: exit http=500', { error: err.message });
    return res.status(500).json({ status: 'failure', message: 'Logout failed' });
  }
};
