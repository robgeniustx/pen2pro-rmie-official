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

    let data = null;
    let errorPayload = null;

    try {
      data = await response.json();
    } catch {
      const rawText = await response.text();
      errorPayload = { message: rawText };
    }

    if (!response.ok) {
      const readableError =
        errorPayload?.detail ||
        errorPayload?.error ||
        errorPayload?.message ||
        data?.detail ||
        data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(
        typeof readableError === "string"
          ? readableError
          : JSON.stringify(readableError)
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
  const blueprintPayload =
    data?.blueprint ||
    data?.result ||
    data?.content ||
    data?.output ||
    data?.plan ||
    data?.data?.blueprint ||
    data?.data ||
    null;

  if (blueprintPayload && typeof blueprintPayload === "object") {
    return {
      ...data,
      blueprint: blueprintPayload,
    };
  }

  if (typeof blueprintPayload === "string" && blueprintPayload.trim()) {
    return {
      ...data,
      blueprint: {
        content: blueprintPayload,
      },
    };
  }

  throw new Error("Blueprint generated, but no blueprint text was returned.");
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
