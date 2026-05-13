
const { createLogger, format, transports, addColors } = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

// ─── Custom Levels (notice sits between error and info) ───────────────────────
const customLevels = {
  levels: { error: 0, notice: 1, info: 2, debug: 3 },
  colors: { error: "red", notice: "magenta", info: "green", debug: "cyan" },
};
addColors(customLevels.colors);

// ─── Log Directory: <project-root>/logs/ ─────────────────────────────────────
const LOG_DIR = path.join(__dirname, "..", "..", "logs");

// ─── File Format (JSON per line) ─────────────────────────────────────────────
const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  format.errors({ stack: true }),
  format.json()
);

// ─── Console Format (colorized, readable) ────────────────────────────────────
const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  format.colorize({ all: true }),
  format.printf(({ timestamp, level, context, message, service, splat, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    const ctx = context ? ` (${context})` : "";
    return `[${timestamp}] [${level.toUpperCase()}]${ctx} ${message}${metaStr}`;
  })
);

// ─── Transports ───────────────────────────────────────────────────────────────
const winstonLogger = createLogger({
  levels: customLevels.levels,
  level: "debug",
  defaultMeta: { service: "auth-service" },
  exitOnError: false,
  transports: [
    // Terminal
    new transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    }),
    // All levels → combined log
    new transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "debug",
      auditFile: path.join(LOG_DIR, ".combined-audit.json"),
    }),
    // Errors only → error log
    new transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "error",
      auditFile: path.join(LOG_DIR, ".error-audit.json"),
    }),
  ],
});

// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * @param {string} context  - "module.functionName" e.g. "authController.signupHandler"
 * @param {string} message  - human-readable description
 * @param {Object} meta     - trackable fields: { userId, email, ip, requestId, ... }
 *
 * Sample JSON line written to file:
 * {"timestamp":"2026-05-03T10:22:11.342Z","level":"info","context":"authController.signupHandler",
 *  "message":"OTP sent","userId":"664abc","email":"john@example.com","ip":"::1","service":"auth-service"}
 */
const logger = {
  debug:  (ctx, msg, meta = {}) => winstonLogger.log("debug",  msg, { context: ctx, ...meta }),
  info:   (ctx, msg, meta = {}) => winstonLogger.log("info",   msg, { context: ctx, ...meta }),
  notice: (ctx, msg, meta = {}) => winstonLogger.log("notice", msg, { context: ctx, ...meta }),
  error:  (ctx, msg, meta = {}) => winstonLogger.log("error",  msg, { context: ctx, ...meta }),
};

module.exports = logger;