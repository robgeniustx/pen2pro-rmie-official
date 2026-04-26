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
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `Request failed with status ${response.status}.`
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
  const blueprint =
    data?.blueprint ||
    data?.data?.blueprint ||
    data?.data ||
    data?.result?.blueprint ||
    data?.result ||
    data;

  if (!blueprint || typeof blueprint !== "object") {
    throw new Error("Blueprint response is missing or invalid.");
  }

  return { blueprint };
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
