const express = require("express");
const path = require("path");

const auditRoutes = require("./routes/audit.routes");
const auditRateLimiter = require("./middleware/rateLimiter");
const requestLogger = require("./middleware/requestLogger");

const app = express();

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    requestId: req.requestId,
    message: "Page Pulse API is running",
  });
});

app.use("/api/audit", auditRateLimiter, auditRoutes);

module.exports = app;
