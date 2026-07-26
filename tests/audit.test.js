const request = require("supertest");
const app = require("../src/app");

describe("Page Pulse API", () => {
  test("GET /health returns healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.requestId).toBeDefined();
  });

  test("POST /api/audit rejects missing URL", async () => {
    const response = await request(app)
      .post("/api/audit")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("URL_REQUIRED");
    expect(response.body.requestId).toBeDefined();
  });

  test("POST /api/audit rejects malformed URL", async () => {
    const response = await request(app)
      .post("/api/audit")
      .send({
        url: "hello-world",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("INVALID_URL");
  });

  test("POST /api/audit blocks localhost", async () => {
    const response = await request(app)
      .post("/api/audit")
      .send({
        url: "http://localhost:3000",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error.code).toBe(
      "PRIVATE_ADDRESS_NOT_ALLOWED"
    );
  });

  test("returns X-Request-ID header", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("preserves client supplied request ID", async () => {
    const response = await request(app)
      .get("/health")
      .set("X-Request-ID", "test-request-123");

    expect(response.headers["x-request-id"]).toBe(
      "test-request-123"
    );

    expect(response.body.requestId).toBe(
      "test-request-123"
    );
  });
});