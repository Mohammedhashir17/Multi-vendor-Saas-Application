require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./common/logger");

const CTX = "server";
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ─── MongoDB Connection ───────────────────────────────────────────────────────

async function connectDatabase() {
  if (!MONGO_URI) {
    logger.error(CTX, "MONGO_URI is not defined in environment variables. Exiting.");
    process.exit(1);
  }

  logger.info(CTX, "Connecting to MongoDB...");

  try {
    await mongoose.connect(MONGO_URI, {
    });

    logger.info(CTX, "MongoDB connected successfully", {
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
    });
  } catch (err) {
    logger.error(CTX, "MongoDB connection failed", { error: err.message });
    process.exit(1);
  }
}

// ─── Start HTTP Server ────────────────────────────────────────────────────────

async function startServer() {
  await connectDatabase();

  const httpServer = app.listen(PORT, () => {
    logger.info(CTX, `HTTP server started`, {
      port: PORT,
      env: process.env.NODE_ENV || "development",
      pid: process.pid,
    });
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  process.on("SIGTERM", () => gracefulShutdown(httpServer, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(httpServer, "SIGINT"));
}

async function gracefulShutdown(server, signal) {
  logger.notice(CTX, `${signal} received — shutting down gracefully...`);

  server.close(async () => {
    logger.info(CTX, "HTTP server closed");
    await mongoose.connection.close();
    logger.info(CTX, "MongoDB connection closed");
    process.exit(0);
  });
}

// ─── Safety Nets ─────────────────────────────────────────────────────────────

process.on("unhandledRejection", (reason) => {
  logger.error(CTX, "Unhandled Promise rejection", {
    reason: reason?.message || String(reason),
    stack: process.env.NODE_ENV === "development" ? reason?.stack : undefined,
  });
});

process.on("uncaughtException", (err) => {
  logger.error(CTX, "Uncaught exception — process will exit", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
startServer();