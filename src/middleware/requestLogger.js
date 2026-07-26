const crypto = require("crypto");

function requestLogger(req, res, next) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  const startTime = Date.now();

  res.on("finish", () => {
    const log = {
      timestamp: new Date().toISOString(),
      level: "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
      ip: req.ip,
    };

    console.log(JSON.stringify(log));
  });

  next();
}

module.exports = requestLogger;