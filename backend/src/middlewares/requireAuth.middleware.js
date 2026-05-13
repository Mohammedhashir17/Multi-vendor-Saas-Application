const jwt = require("jsonwebtoken");
const { sendError, HTTP } = require("../common/shared");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return sendError(res, HTTP.UNAUTHORIZED, "Access token required.");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { sub: userId, role, iat, exp }
    next();
  } catch (err) {
    return sendError(res, HTTP.UNAUTHORIZED, "Invalid or expired access token.");
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, HTTP.FORBIDDEN, `Access denied. Required role: ${roles.join(" or ")}`);
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };