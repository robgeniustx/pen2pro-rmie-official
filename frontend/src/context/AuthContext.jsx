import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authLogin, authSignup, authMe, authLogout } from "../services/authApi.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "pen2pro_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authMe(token)
      .then((data) => setUser(data.user))
      .catch(() => { setToken(""); localStorage.removeItem(TOKEN_KEY); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const _persist = useCallback((tok, userData) => {
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    setUser(userData);
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await authSignup(email, password);
    _persist(data.access_token, data.user);
    return data;
  }, [_persist]);

  const login = useCallback(async (email, password) => {
    const data = await authLogin(email, password);
    _persist(data.access_token, data.user);
    return data;
  }, [_persist]);

  const logout = useCallback(async () => {
    try { await authLogout(token); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: Boolean(user), tier: user?.tier || "free", signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
