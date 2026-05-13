import { Router } from 'express';
import * as logger from '../common/logger.js';
import { getRequestPayload, redactForLog } from '../common/shared.js';
import {
  loginRouteHandler,
  registerRouteHandler,
  verifyRegistrationOtpRouteHandler,
  resendRegistrationOtpRouteHandler,
  googleAuthRouteHandler,
  logoutRouteHandler,
  requestPasswordResetOtpRouteHandler,
  confirmPasswordResetRouteHandler,
} from '../controllers/auth-controllers.js';

const router = Router();
const moduleName = 'auth-routes';

router.post('/auth/login', async (req, res, next) => {
  const routeId = 'POST /auth/login';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path, body: redactForLog(getRequestPayload(req)) });
    const payload = getRequestPayload(req);
    const emailOrMobile = payload.emailOrMobile ?? payload.email;
    const { password } = payload;
    logger.debug(moduleName, `${routeId}: validate credentials present`, {
      hasIdentifier: !!emailOrMobile,
      passwordPresent: !!password,
    });
    if (!emailOrMobile || !password) {
      logger.notice(moduleName, `${routeId}: exit http=400`, { reason: 'missing_identifier_or_password' });
      return res.status(400).json({
        status: 'failure',
        message: 'Missing required fields: email or mobile, and password',
      });
    }

    logger.debug(moduleName, `${routeId}: call loginRouteHandler`);
    await loginRouteHandler(req, res, emailOrMobile, password);
    logger.info(moduleName, `${routeId}: loginRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`, getRequestPayload(req)?.emailOrMobile);
    next(error);
  }
});

router.post('/auth/register', async (req, res, next) => {
  const routeId = 'POST /auth/register';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path, body: redactForLog(getRequestPayload(req)) });
    const payload = getRequestPayload(req);
    const { email, password, confirmPassword, name, role, businessName, mobile } = payload;
    logger.debug(moduleName, `${routeId}: validate fields`, { email, name, role, passwordPresent: !!password, mobilePresent: !!mobile });
    if (!email || !password || !mobile) {
      logger.notice(moduleName, `${routeId}: exit http=400`, { reason: 'missing_fields' });
      return res.status(400).json({
        status: 'failure',
        message: 'Missing required fields: email, password, and mobile',
      });
    }

    logger.debug(moduleName, `${routeId}: call registerRouteHandler`);
    await registerRouteHandler(req, res, { email, password, confirmPassword, name, role, businessName, mobile });
    logger.info(moduleName, `${routeId}: registerRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`, { email });
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`, getRequestPayload(req)?.email);
    next(error);
  }
});

router.post('/auth/register/verify', async (req, res, next) => {
  const routeId = 'POST /auth/register/verify';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path, body: redactForLog(getRequestPayload(req)) });
    const payload = getRequestPayload(req);
    const { email, otp } = payload;
    await verifyRegistrationOtpRouteHandler(req, res, { email, otp });
    logger.info(moduleName, `${routeId} completed`, { email });
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`, getRequestPayload(req)?.email);
    next(error);
  }
});

router.post('/auth/register/resend', async (req, res, next) => {
  const routeId = 'POST /auth/register/resend';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path, body: redactForLog(getRequestPayload(req)) });
    const payload = getRequestPayload(req);
    const { email } = payload;
    await resendRegistrationOtpRouteHandler(req, res, { email });
    logger.info(moduleName, `${routeId} completed`, { email });
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`, getRequestPayload(req)?.email);
    next(error);
  }
});

router.post('/auth/logout', async (req, res, next) => {
  const routeId = 'POST /auth/logout';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path });
    logger.debug(moduleName, `${routeId}: call logoutRouteHandler`);
    await logoutRouteHandler(req, res);
    logger.info(moduleName, `${routeId}: logoutRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`);
    next(error);
  }
});

router.post('/auth/google', async (req, res, next) => {
  const routeId = 'POST /auth/google';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { method: req.method, path: req.path });
    const { credential } = getRequestPayload(req);
    if (!credential) {
      logger.notice(moduleName, `${routeId}: exit http=400`, { reason: 'missing_credential' });
      return res.status(400).json({ status: 'failure', message: 'Google credential token required' });
    }
    logger.debug(moduleName, `${routeId}: call googleAuthRouteHandler`);
    await googleAuthRouteHandler(req, res, credential);
    logger.info(moduleName, `${routeId}: googleAuthRouteHandler returned`);
    logger.notice(moduleName, `${routeId} completed`);
  } catch (error) {
    const errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(moduleName, `${routeId} error: ${errorMessage}`);
    next(error);
  }
});

router.post('/auth/password-reset/request', async (req, res, next) => {
  const routeId = 'POST /auth/password-reset/request';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { body: redactForLog(getRequestPayload(req)) });
    const { email } = getRequestPayload(req);
    if (!email || !String(email).trim().includes('@')) {
      logger.notice(moduleName, `${routeId}: exit http=400`, { reason: 'invalid_email' });
      return res.status(400).json({ status: 'failure', message: 'Valid email is required' });
    }
    await requestPasswordResetOtpRouteHandler(req, res, email);
    logger.info(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

router.post('/auth/password-reset/confirm', async (req, res, next) => {
  const routeId = 'POST /auth/password-reset/confirm';
  try {
    logger.debug(moduleName, `${routeId}: enter`, { body: redactForLog(getRequestPayload(req)) });
    const payload = getRequestPayload(req);
    const { email, otp, newPassword, confirmPassword } = payload;
    await confirmPasswordResetRouteHandler(req, res, { email, otp, newPassword, confirmPassword });
    logger.info(moduleName, `${routeId} completed`);
  } catch (error) {
    logger.error(moduleName, `${routeId} error: ${error.message}`);
    next(error);
  }
});

export default router;
