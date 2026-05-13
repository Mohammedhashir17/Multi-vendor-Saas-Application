const { z } = require("zod");
const { ALLOWED_ROLES, ROLES } = require("./shared");

// ─── Reusable Field Definitions ───────────────────────────────────────────────

const emailField = z
  .string({ required_error: "Email is required." })
  .trim()
  .toLowerCase()
  .email("Invalid email address format.");

const phoneField = z
  .string({ required_error: "Phone number is required." })
  .trim()
  .regex(/^\d{10,15}$/, "Phone number must be numeric and 10–15 digits.");

const passwordField = z
  .string({ required_error: "Password is required." })
  .min(6, "Password must be at least 6 characters.")
  .max(72, "Password must not exceed 72 characters."); // bcrypt hard limit

const otpField = z
  .string({ required_error: "OTP is required." })
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit numeric code.");

// ─── Signup Schema ────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    username: z
      .string({ required_error: "Username is required." })
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must not exceed 50 characters."),

    email: emailField,

    phoneNumber: phoneField,

    password: passwordField,

    confirmPassword: z
      .string({ required_error: "Confirm password is required." }),

    role: z
      .enum(ALLOWED_ROLES, {
        errorMap: () => ({
          message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}.`,
        }),
      })
      .optional()
      .default(ROLES.CUSTOMER),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Password and confirm password do not match.",
      });
    }
  });

// ─── Verify OTP Schema ────────────────────────────────────────────────────────

/**
 * Validates POST /api/auth/verify-otp body.
 */
const verifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

// ─── Resend OTP Schema ────────────────────────────────────────────────────────

/**
 * Validates POST /api/auth/resend-otp body.
 */
const resendOtpSchema = z.object({
  email: emailField,
});

// Login Schema

const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or phone number is required" })
    .trim()
    .min(1, "Email or phone number is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

// ─── Schema Runner ────────────────────────────────────────────────────────────

function validateSchema(schema, data) {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Flatten Zod issues into clean field → message pairs
  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "general",
    message: issue.message,
  }));

  return { success: false, errors };
}

// ─── Forgot Password ────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: emailField
});

// ─── Verify Reset OTP ────────────────────────────────────────────────────────
const verifyResetOtpSchema = z.object({
  email: emailField,

  otp: otpField
});

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPasswordSchema = z.object({
  email: emailField,

  otp: z.string().optional(),

  newPassword: passwordField,
});


module.exports = {
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  validateSchema,
  // login schema
  loginSchema,
  // reset password schemas
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
};