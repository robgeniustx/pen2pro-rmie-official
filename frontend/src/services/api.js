const rawApiBase = import.meta.env.VITE_API_BASE_URL || "";
export const apiBase = rawApiBase.replace(/\/+$/, "");

async function request(path, options = {}, config = {}) {
  const { timeout = 30000 } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    let data = null;

    if (isJson) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      let errorPayload = data;
      if (!errorPayload) {
        const errorText = await response.text();
        errorPayload = { message: errorText };
      }
      const details = errorPayload?.detail;
      const detailText = typeof details === "string" ? details : details ? JSON.stringify(details) : "";
      throw new Error(
        detailText ||
          errorPayload?.error ||
          errorPayload?.message ||
          `Blueprint generation failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function fetchHealth() {
  return request("/api/health");
}

export function fetchBackendStatus() {
  return fetchHealth();
}

export function fetchPricing() {
  return request("/api/pricing");
}

export function fetchPricingPlans() {
  return fetchPricing();
}

export function trackEvent({ eventName, source = "direct", properties = {} }) {
  return request("/api/events", {
    method: "POST",
    body: JSON.stringify({
      event_name: eventName,
      source,
      properties,
    }),
  }).catch(() => null);
}

export function joinWaitlist({ email, goal, source = "homepage" }) {
  return request("/api/waitlist", {
    method: "POST",
    body: JSON.stringify({ email, goal, source }),
  });
}

export function createFounderCheckout(tierId) {
  return request("/api/founder-checkout", {
    method: "POST",
    body: JSON.stringify({ tier_id: tierId }),
  });
}

function normalizeBlueprintResponse(data) {
  const blueprintText =
    data?.blueprint ||
    data?.result ||
    data?.content ||
    data?.output ||
    data?.plan ||
    data?.data?.blueprint ||
    data?.data ||
    data?.result?.blueprint ||
    "";
  const normalizedText = typeof blueprintText === "object" ? JSON.stringify(blueprintText, null, 2) : String(blueprintText || "").trim();
  const fallbackText = "Blueprint generated, but no blueprint text was returned.";
  const blueprint = data?.blueprint && typeof data.blueprint === "object" ? data.blueprint : data?.result?.blueprint || data?.data?.blueprint || data?.data;

  return {
    ...data,
    blueprintText: normalizedText || fallbackText,
    blueprint: blueprint && typeof blueprint === "object" ? blueprint : {},
  };
}

export async function generateStarterBlueprint(payload) {
  const data = await request(
    "/api/rmie/starter-generate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    {
      timeout: 45000,
    }
  );

  return normalizeBlueprintResponse(data);
}
