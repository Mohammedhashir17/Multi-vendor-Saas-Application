const { z } = require("zod");
const { isValidEmail, isValidPhone } = require("./shared");

const createVendorSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .trim(),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .refine(isValidEmail, "Invalid email address"),

  phoneNumber: z
    .string()
    .trim()
    .refine(isValidPhone, "Invalid phone number")
    .optional()
    .nullable(),
});

module.exports = { createVendorSchema };