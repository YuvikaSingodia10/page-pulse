const {
  getCachedAudit,
  setCachedAudit,
  clearCache,
} = require("../src/cache/auditCache");

describe("Audit cache", () => {
  beforeEach(() => {
    clearCache();
  });

  test("returns null for a cache miss", () => {
    expect(
      getCachedAudit("https://example.com/")
    ).toBeNull();
  });

  test("stores and retrieves audit results", () => {
    const data = {
      statusCode: 200,
      title: "Example",
    };

    setCachedAudit("https://example.com/", data);

    expect(
      getCachedAudit("https://example.com/")
    ).toEqual(data);
  });

  test("different URLs use different cache entries", () => {
    setCachedAudit("https://example.com/", {
      statusCode: 200,
    });

    expect(
      getCachedAudit("https://openai.com/")
    ).toBeNull();
  });
});