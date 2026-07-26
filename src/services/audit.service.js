const axios = require("axios");
const config = require("../config");

async function auditUrl(url) {
  const startTime = Date.now();

  const response = await axios.get(url, {
    timeout: config.requestTimeoutMs,
    maxRedirects: 5,
    responseType: "text",
  });

  const responseTimeMs = Date.now() - startTime;

  const html =
    typeof response.data === "string" ? response.data : "";

  // Extract page title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch
    ? titleMatch[1].replace(/\s+/g, " ").trim()
    : null;

  // Calculate approximate response size
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