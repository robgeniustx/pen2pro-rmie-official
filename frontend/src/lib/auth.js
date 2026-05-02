const USER_KEY = "pen2pro_user";
const USERS_KEY = "pen2pro_users";
const TOKEN_KEY = "pen2pro_token";
function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
export function getCurrentUser() { return readJson(USER_KEY, null); }
export function isAuthenticated() { return Boolean(getCurrentUser()); }
export async function loginUser(email, password) { const users = readJson(USERS_KEY, []); const found = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password); if (!found) throw new Error("Invalid email or password."); const safeUser = { ...found }; delete safeUser.password; writeJson(USER_KEY, safeUser); localStorage.setItem(TOKEN_KEY, `local-${Date.now()}`); return safeUser; }
export async function signupUser({ name, email, password, businessIdea, tier = "free" }) { const users = readJson(USERS_KEY, []); const exists = users.some((u) => u.email.toLowerCase() === String(email).toLowerCase()); if (exists) throw new Error("An account with this email already exists."); const newUser = { id: `u_${Date.now()}`, name: name?.trim() || "Founder", email: String(email).trim(), password, businessIdea: businessIdea?.trim() || "", tier, createdAt: new Date().toISOString() }; users.push(newUser); writeJson(USERS_KEY, users); const safeUser = { ...newUser }; delete safeUser.password; writeJson(USER_KEY, safeUser); localStorage.setItem(TOKEN_KEY, `local-${Date.now()}`); return safeUser; }
export function logoutUser() { localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); }
export function getUserTier() { return getCurrentUser()?.tier || "free"; }
export function setUserTier(tier) { const current = getCurrentUser(); if (!current) return; const next = { ...current, tier }; writeJson(USER_KEY, next); const users = readJson(USERS_KEY, []); const idx = users.findIndex((u) => u.email === current.email); if (idx >= 0) { users[idx] = { ...users[idx], tier }; writeJson(USERS_KEY, users); } }
// TODO: Replace localStorage auth with backend JWT/session endpoints when production auth is finalized.
