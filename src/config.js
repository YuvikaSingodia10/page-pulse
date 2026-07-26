require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 3000,

  requestTimeoutMs:
    Number(process.env.REQUEST_TIMEOUT_MS) || 8000,

  cacheTtlSeconds:
    Number(process.env.CACHE_TTL_SECONDS) || 300,

  rateLimitWindowMs:
    Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,

  rateLimitMaxRequests:
    Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 20,

  maxConcurrentAudits:
    Number(process.env.MAX_CONCURRENT_AUDITS) || 5,
};