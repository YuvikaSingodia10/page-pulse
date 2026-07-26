const { auditUrl } = require("../services/audit.service");
const {
  getCachedAudit,
  setCachedAudit,
} = require("../cache/auditCache");
const {
  runWithConcurrencyLimit,
} = require("../services/concurrency.service");
const {
  validateAuditUrl,
} = require("../utils/urlValidator");

async function auditWebsite(req, res) {
  try {
    const validation = await validateAuditUrl(req.body?.url);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        requestId: req.requestId,
        error: {
          code: validation.code,
          message: validation.message,
        },
      });
    }

    const normalizedUrl = validation.normalizedUrl;

    const cachedResult = getCachedAudit(normalizedUrl);

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        requestId: req.requestId,
        cached: true,
        data: cachedResult,
      });
    }

    const result = await runWithConcurrencyLimit(() =>
      auditUrl(normalizedUrl)
    );

    setCachedAudit(normalizedUrl, result);

    return res.status(200).json({
      success: true,
      requestId: req.requestId,
      cached: false,
      data: result,
    });
  } catch (error) {
    // Log the real upstream error for production debugging
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        requestId: req.requestId,
        event: "audit_failed",
        errorCode: error.code || null,
        message: error.message,
        upstreamStatus: error.response?.status || null,
      })
    );

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return res.status(504).json({
        success: false,
        requestId: req.requestId,
        error: {
          code: "UPSTREAM_TIMEOUT",
          message: "The website took too long to respond.",
        },
      });
    }

    return res.status(502).json({
      success: false,
      requestId: req.requestId,
      error: {
        code: "AUDIT_FAILED",
        message: "Unable to audit the requested website.",
      },
    });
  }
}

module.exports = {
  auditWebsite,
};
