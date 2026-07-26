const form = document.getElementById("auditForm");
const input = document.getElementById("urlInput");
const button = document.getElementById("auditButton");
const resultSection = document.getElementById("result");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";
  resultSection.classList.add("hidden");

  button.disabled = true;
  button.textContent = "Auditing...";

  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: input.value.trim(),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error?.message || "Unable to audit this page."
      );
    }

    const data = payload.data;

    document.getElementById("statusCode").textContent =
      data.statusCode;

    document.getElementById("responseTime").textContent =
      `${data.responseTimeMs} ms`;

    document.getElementById("httpsStatus").textContent =
      data.https ? "Yes" : "No";

    document.getElementById("pageSize").textContent =
      `${(data.pageSizeBytes / 1024).toFixed(2)} KB`;

    document.getElementById("pageTitle").textContent =
      data.title || "No title detected";

    document.getElementById("contentType").textContent =
      data.contentType || "Unknown";

    document.getElementById("finalUrl").textContent =
      data.finalUrl;

    document.getElementById("cacheBadge").textContent =
      payload.cached ? "Cached result" : "Fresh audit";

    resultSection.classList.remove("hidden");

  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Audit Page";
  }
});