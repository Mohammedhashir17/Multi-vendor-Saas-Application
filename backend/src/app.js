const express = require("express");

const authRouter = require("./routes/auth.routes");
const { requestLoggerMiddleware, notFoundMiddleware, globalErrorMiddleware} = require("./middlewares/auth.middleware");
const testRouter = require("./routes/test.routes");
const adminRoutes = require("./routes/admin.routes");

const logger = require("./common/logger");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json({ limit: "10kb" }));          
app.use(express.urlencoded({ extended: false })); 
// Add this BEFORE your route mounts:

app.use(requestLoggerMiddleware);
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  logger.debug("App.healthRoute", "Health check ping");
  res.status(200).json({ success: true, message: "Server is running." });
});

// ─── Route Modules ────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// test route
app.use("/api/test", testRouter);

// admin

app.use("/api/admin", adminRoutes);

// ─── 404 Catch-all (after all routes) ────────────────────────────────────────
app.use(notFoundMiddleware);

// ─── Global Error Handler (must be last, 4-param) ────────────────────────────
app.use(globalErrorMiddleware);

module.exports = app;