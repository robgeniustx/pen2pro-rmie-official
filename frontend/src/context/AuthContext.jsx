import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authLogin, authSignup, authMe, authLogout } from "../services/authApi.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "pen2pro_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!token) return;
    let isCancelled = false;

    authMe(token)
      .then((data) => { if (!isCancelled) setUser(data.user); })
      .catch(() => {
        if (!isCancelled) {
          setToken("");
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => { if (!isCancelled) setLoading(false); });

    return () => { isCancelled = true; };
  }, [token]);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
