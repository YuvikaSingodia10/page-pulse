const config = require("../config");

const cache = new Map();

function getCachedAudit(url) {
  const entry = cache.get(url);

  if (!entry) {
    return null;
  }

  // Remove expired cache
  if (Date.now() > entry.expiresAt) {
    cache.delete(url);
    return null;
  }

  return entry.data;
}

function setCachedAudit(url, data) {
  const ttlMs = config.cacheTtlSeconds * 1000;

  cache.set(url, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function clearCache() {
  cache.clear();
}

module.exports = {
  getCachedAudit,
  setCachedAudit,
  clearCache,
};