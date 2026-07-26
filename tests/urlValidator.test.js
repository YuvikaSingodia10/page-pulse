const {
  validateAuditUrl,
  isPrivateIp,
} = require("../src/utils/urlValidator");

describe("URL validation", () => {
  test("rejects a missing URL", async () => {
    const result = await validateAuditUrl();

    expect(result.valid).toBe(false);
    expect(result.code).toBe("URL_REQUIRED");
  });

  test("rejects malformed URLs", async () => {
    const result = await validateAuditUrl("not-a-url");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("INVALID_URL");
  });

  test("rejects unsupported protocols", async () => {
    const result = await validateAuditUrl(
      "ftp://example.com"
    );

    expect(result.valid).toBe(false);
    expect(result.code).toBe("UNSUPPORTED_PROTOCOL");
  });

  test("rejects localhost", async () => {
    const result = await validateAuditUrl(
      "http://localhost:3000"
    );

    expect(result.valid).toBe(false);
    expect(result.code).toBe(
      "PRIVATE_ADDRESS_NOT_ALLOWED"
    );
  });

  test("recognizes private IPv4 addresses", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.0.0.1")).toBe(true);
    expect(isPrivateIp("192.168.1.5")).toBe(true);
  });

  test("does not classify a public IPv4 as private", () => {
    expect(isPrivateIp("8.8.8.8")).toBe(false);
  });
});