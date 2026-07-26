const axios = require("axios");
const config = require("../config");

async function auditUrl(url) {
  const startTime = Date.now();

  const response = await axios.get(url, {
    timeout: config.requestTimeoutMs,
    maxRedirects: 5,
    responseType: "text",

    // HTTP error statuses are still valid audit results.
    validateStatus: () => true,

    // Identify the auditor instead of using Axios' default user agent.
    headers: {
      "User-Agent":
        "PagePulse/1.0 (+https://page-pulse-qdba.onrender.com)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const responseTimeMs = Date.now() - startTime;

  const html =
    typeof response.data === "string" ? response.data : "";

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);

  const title = titleMatch
    ? titleMatch[1].replace(/\s+/g, " ").trim()
    : null;

  const pageSizeBytes = Buffer.byteLength(html, "utf8");

  return {
    url,
    finalUrl: response.request?.res?.responseUrl || url,
    statusCode: response.status,
    title,
    responseTimeMs,
    https: url.startsWith("https://"),
    contentType: response.headers["content-type"] || null,
    pageSizeBytes,
    auditedAt: new Date().toISOString(),
  };
}

module.exports = {
  auditUrl,
};
