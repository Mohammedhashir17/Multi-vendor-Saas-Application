const crypto = require("crypto");
const logger = require("../common/logger");
const { sendError, HTTP } = require("../common/shared");

// ─── Request ID Stamper ───────────────────────────────────────────────────────

function requestIdMiddleware(req, res, next) {
  req.requestId = crypto.randomBytes(4).toString("hex"); // e.g. "a1b2c3d4"
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

// ─── Request Logger ───────────────────────────────────────────────────────────

function requestLoggerMiddleware(req, res, next) {
  const { method, originalUrl, ip, requestId } = req;

  logger.info("middleware.requestLogger", `→ ${method} ${originalUrl}`, {
    requestId,
    ip: ip || req.connection?.remoteAddress,
    userAgent: req.get("User-Agent"),
  });

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "notice" : "info";

    logger[level](
      "middleware.requestLogger",
      `← ${method} ${originalUrl} [${statusCode}] ${duration}ms`,
      { requestId, statusCode, duration }
    );
  });

  next();
}

// ─── 404 Not Found ────────────────────────────────────────────────────────────

function notFoundMiddleware(req, res) {
  logger.notice("middleware.notFound", "Route not found", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
  });
  return sendError(
    res,
    HTTP.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found.`
  );
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
function globalErrorMiddleware(err, req, res, next) {
  const CTX = "middleware.globalError";
  const meta = { requestId: req.requestId };

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    logger.notice(CTX, "Mongoose validation error", { ...meta, messages });
    return sendError(res, HTTP.BAD_REQUEST, "Validation failed.", { messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    logger.notice(CTX, "Duplicate key error", { ...meta, field });
    return sendError(res, HTTP.CONFLICT, `An account with this ${field} already exists.`);
  }

  if (err.name === "CastError") {
    logger.notice(CTX, "Invalid ID format", { ...meta, path: err.path });
    return sendError(res, HTTP.BAD_REQUEST, "Invalid ID format.");
  }

  logger.error(CTX, "Unhandled server error", {
    ...meta,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  return sendError(
    res,
    HTTP.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === "development"
      ? err.message
      : "An unexpected error occurred. Please try again."
  );
}

module.exports = {
  requestIdMiddleware,
  requestLoggerMiddleware,
  notFoundMiddleware,
  globalErrorMiddleware,
};