export const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
	const response = await fetch(`${apiBase}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});

	const contentType = response.headers.get("content-type") || "";
	const data = contentType.includes("application/json") ? await response.json() : null;

	if (!response.ok) {
		throw new Error(data?.detail || data?.message || "Request failed.");
	}

	return data;
}

export function fetchHealth() {
	return request("/");
}

export function fetchPricing() {
	return request("/api/pricing");
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

export function generateStarterBlueprint(payload) {
	return request("/api/rmie/starter-generate", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}
