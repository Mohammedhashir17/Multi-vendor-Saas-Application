const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/requireAuth.middleware");
const { requireRole } = require("../middlewares/requireAuth.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");
const { createVendorSchema } = require("../common/admin.schemas");
const { createVendorHandler } = require("../controllers/admin.controller");

// All admin routes require authentication + admin role
router.use(requireAuth);
router.use(requireRole("admin"));

// POST /admin/vendors
router.post(
  "/vendors",
  validateRequest(createVendorSchema),
  createVendorHandler
);

module.exports = router;