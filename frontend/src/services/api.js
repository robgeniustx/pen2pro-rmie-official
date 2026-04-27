const rawApiBase = import.meta.env.VITE_API_BASE_URL || "";
export const apiBase = rawApiBase.replace(/\/+$/, "");

function toReadableError(payload, fallback) {
  if (!payload) return fallback;

  if (typeof payload === "string" && payload.trim()) return payload.trim();

  const detail = payload?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }

  if (typeof payload?.error === "string" && payload.error.trim()) return payload.error;
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;

  try {
    return JSON.stringify(payload);
  } catch {
    return fallback;
  }
}

async function parseResponseBody(response) {
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

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

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(toReadableError(data, `Request failed with status ${response.status}`));
    }

    return data ?? {};
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    if (error instanceof Error) throw error;
    throw new Error(toReadableError(error, "Request failed. Please try again."));
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
    data?.result?.blueprint ||
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

  throw new Error("Blueprint generated, but no blueprint content was returned.");
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
