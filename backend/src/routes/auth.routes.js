const express = require("express");

const { signupHandler, verifyOtpHandler,resendOtpHandler, loginHandler, refreshHandler, verifyResetOtpHandler, resetPasswordHandler, forgotPasswordHandler, logoutHandler, logoutAllHandler} = require("../controllers/auth.controller");
const { asyncHandler } = require("../common/shared");
const { validateRequest } = require("../middlewares/validate.middleware");
const { signupSchema, verifyOtpSchema, resendOtpSchema, loginSchema, forgotPasswordSchema, verifyResetOtpSchema, resetPasswordSchema} = require("../common/auth.schemas");

const authRouter = express.Router();

// POST /api/auth/signup
authRouter.post(
  "/signup",
  validateRequest(signupSchema),
  asyncHandler(signupHandler)
);

// POST /api/auth/verify-otp
authRouter.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  asyncHandler(verifyOtpHandler)
);

// POST /api/auth/resend-otp
authRouter.post(
  "/resend-otp",
  validateRequest(resendOtpSchema),
  asyncHandler(resendOtpHandler)
);


// Login Routes

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(loginHandler)
);

// Refresh token route
authRouter.post("/refresh", asyncHandler(refreshHandler));


// Reset password routes would go here (e.g. /forgot-password, /verify-reset-otp, /reset-password)

// POST /api/auth/forgot
// Step 1 — User provides email → OTP sent
authRouter.post(
  "/forgot",
  validateRequest(forgotPasswordSchema),
  asyncHandler(forgotPasswordHandler)
);
 
// POST /api/auth/verify-otp
// Step 2 — User provides email + OTP → OTP verified (token not issued yet)
authRouter.post(
  "/verify-reset-otp",
  validateRequest(verifyResetOtpSchema),
  asyncHandler(verifyResetOtpHandler)
);
 
// POST /api/auth/reset
// Step 3 — User provides email + OTP + newPassword → password updated
authRouter.post(
  "/reset",
  validateRequest(resetPasswordSchema),
  asyncHandler(resetPasswordHandler)
);

// logout routes
authRouter.post("/logout",     asyncHandler(logoutHandler));
authRouter.post("/logout-all", asyncHandler(logoutAllHandler));

module.exports = authRouter;