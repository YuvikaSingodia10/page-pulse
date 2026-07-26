const net = require("net");
const dns = require("dns").promises;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);

    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 0
    );
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();

    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return false;
}

async function validateAuditUrl(value) {
  if (!value || typeof value !== "string") {
    return {
      valid: false,
      code: "URL_REQUIRED",
      message: "URL is required.",
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    return {
      valid: false,
      code: "INVALID_URL",
      message: "Please provide a valid URL.",
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      valid: false,
      code: "UNSUPPORTED_PROTOCOL",
      message: "Only HTTP and HTTPS URLs are supported.",
    };
  }

  if (parsedUrl.username || parsedUrl.password) {
    return {
      valid: false,
      code: "URL_CREDENTIALS_NOT_ALLOWED",
      message: "URLs containing credentials are not allowed.",
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return {
      valid: false,
      code: "PRIVATE_ADDRESS_NOT_ALLOWED",
      message: "Private or local network addresses are not allowed.",
    };
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true });

    if (
      addresses.length === 0 ||
      addresses.some(({ address }) => isPrivateIp(address))
    ) {
      return {
        valid: false,
        code: "PRIVATE_ADDRESS_NOT_ALLOWED",
        message: "Private or local network addresses are not allowed.",
      };
    }
  } catch {
    return {
      valid: false,
      code: "HOST_RESOLUTION_FAILED",
      message: "The hostname could not be resolved.",
    };
  }

  return {
    valid: true,
    normalizedUrl: parsedUrl.toString(),
  };
}

module.exports = {
  validateAuditUrl,
  isPrivateIp,
};