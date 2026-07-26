const rateLimit = require("express-rate-limit");
const config = require("../config");

const auditRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMaxRequests,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      requestId: req.requestId,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many audit requests. Please try again later.",
      },
    });
  },
});

module.exports = auditRateLimiter;