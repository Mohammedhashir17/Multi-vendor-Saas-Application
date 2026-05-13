const { Router } = require("express");
const { requireAuth, requireRole } = require("../middlewares/requireAuth.middleware");
const { sendSuccess, HTTP } = require("../common/shared");

const router = Router();

// Any logged-in user
router.get("/me", requireAuth, (req, res) => {
  return sendSuccess(res, HTTP.OK, "Token is valid.", {
    userId: req.user.sub,
    role:   req.user.role,
    tokenExpiresAt: new Date(req.user.exp * 1000).toISOString(),
  });
});

// Customer only
router.get("/customer", requireAuth, requireRole("customer"), (req, res) => {
  return sendSuccess(res, HTTP.OK, "Welcome, Customer!", {
    userId: req.user.sub,
    role:   req.user.role,
    canAccess: ["browse products", "place orders", "view own orders"],
  });
});

// Vendor only
router.get("/vendor", requireAuth, requireRole("vendor"), (req, res) => {
  return sendSuccess(res, HTTP.OK, "Welcome, Vendor!", {
    userId: req.user.sub,
    role:   req.user.role,
    canAccess: ["manage own products", "view own orders", "view own revenue"],
  });
});

// Super admin only
router.get("/super-admin", requireAuth, requireRole("super_admin"), (req, res) => {
  return sendSuccess(res, HTTP.OK, "Welcome, Super Admin!", {
    userId: req.user.sub,
    role:   req.user.role,
    canAccess: ["manage all users", "manage all vendors", "view all orders", "platform settings"],
  });
});

module.exports = router;