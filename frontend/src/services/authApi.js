import { apiBase } from "./api.js";

async function authRequest(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiBase}${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || data?.message || `Request failed (${res.status})`);
  return data;
}

export const authSignup = (email, password) =>
  authRequest("/api/auth/signup", { email, password });

export const authLogin = (email, password) =>
  authRequest("/api/auth/login", { email, password });

export const authMe = (token) =>
  authRequest("/api/auth/me", null, token);

export const authLogout = (token) =>
  authRequest("/api/auth/logout", {}, token);
