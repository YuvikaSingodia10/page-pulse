# Page Pulse

Page Pulse is a production-oriented URL audit service that checks the basic health and metadata of a public webpage while protecting the API with validation, timeouts, caching, rate limiting, concurrency control, request tracing, and structured error handling.

I built it as part of the Digital Heroes practical task, with the focus on making a small service behave reliably rather than simply demonstrating that a URL can be fetched.

## Features

- Audits public HTTP and HTTPS URLs
- Reports HTTP status code, response time, page title, content type, page size, HTTPS usage, and final URL
- Configurable upstream request timeout
- URL validation and blocking of local/private network targets
- Configurable in-memory caching
- Per-client rate limiting
- Configurable concurrent audit limit
- Structured JSON logging
- Unique request IDs for tracing
- Consistent structured API errors
- Responsive web interface
- Automated Jest and Supertest test suite
- GitHub Actions CI on every push and pull request

## API Contract

### Health Check

`GET /health`

Example response:

```json
{
  "success": true,
  "requestId": "92c5209c-1234-4567-8901-example",
  "message": "Page Pulse API is running"
}
```

### Audit a URL

`POST /api/audit`

Request body:

```json
{
  "url": "https://example.com"
}
```

Example successful response:

```json
{
  "success": true,
  "requestId": "1c1eb2c4-c452-49c8-ae86-ff2795c856de",
  "cached": false,
  "data": {
    "url": "https://example.com/",
    "finalUrl": "https://example.com/",
    "statusCode": 200,
    "title": "Example Domain",
    "responseTimeMs": 180,
    "https": true,
    "contentType": "text/html",
    "pageSizeBytes": 559,
    "auditedAt": "2026-07-26T17:09:27.892Z"
  }
}
```

A repeat request within the configured cache window returns the stored audit with:

```json
{
  "cached": true
}
```

### Error Format

Errors use a consistent structure:

```json
{
  "success": false,
  "requestId": "request-id",
  "error": {
    "code": "INVALID_URL",
    "message": "Please provide a valid URL."
  }
}
```

Possible errors include invalid URLs, unsupported protocols, private/local addresses, upstream timeouts, rate-limit violations, and audit failures.

## Configuration

Copy `.env.example` to `.env`.

```env
PORT=3000
REQUEST_TIMEOUT_MS=8000
CACHE_TTL_SECONDS=300
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
MAX_CONCURRENT_AUDITS=5
```

This keeps operational limits configurable instead of hard-coding them into the application.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Then open:

`http://localhost:3000`

Run the tests with:

```bash
npm test
```

## Reliability and Security Decisions

### Caching

Successful audits are cached by normalized URL for a configurable TTL. This avoids repeatedly fetching the same upstream page during the cache window.

The current implementation intentionally uses an in-memory cache to keep the deployment lightweight. For a horizontally scaled production service, I would move this state to Redis so cache entries can be shared between instances.

### Rate Limiting

Audit requests are limited per client IP. The request limit and time window are environment-configurable.

### Concurrency Control

Only a configured number of upstream audits can execute simultaneously. Additional audits wait in a queue, preventing a burst of requests from creating an uncontrolled number of outbound connections.

### Request Tracing

Every request receives an `X-Request-ID`. If a client supplies one, it is preserved; otherwise Page Pulse generates a UUID.

Logs are emitted as structured JSON containing the request ID, method, route, response status, duration, and client IP.

### URL Safety

Only HTTP and HTTPS URLs are accepted. Localhost and private/local network destinations are rejected after hostname resolution to reduce SSRF risk.

For a larger production system, I would additionally enforce the same destination checks across every redirect hop and use infrastructure-level egress controls.

## Testing and CI

The project includes automated tests for:

- URL validation
- Private/local address detection
- Cache behavior
- Health endpoint
- Structured validation errors
- Request ID generation and propagation

The current suite contains **15 automated tests**.

GitHub Actions runs the test suite automatically on pushes and pull requests to `main`.

## Assumption

The task describes a URL-audit service without specifying the exact audit metrics. I interpreted an audit as a lightweight HTTP health and metadata check rather than a full browser-based performance or SEO scan. Page Pulse therefore reports availability and response metadata while focusing the engineering effort on resilience, caching, abuse protection, observability, and testability.

## AI Usage

I used AI as a development assistant to clarify production API concepts, review implementation options, generate initial test cases, and troubleshoot issues such as Windows/Linux filename case sensitivity in CI. I reviewed and tested the generated suggestions locally, changed the project structure and validation behavior where needed, and verified the final implementation through the automated test suite and GitHub Actions rather than using model output unchanged.

## Live Application

Live URL : https://page-pulse-qdba.onrender.com/

---

[Built for Digital Heroes Training Task](https://digitalheroesco.com)
