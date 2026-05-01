import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ navigateTo, mode: initialMode = "login" }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = () => { setMode(m => m === "login" ? "signup" : "login"); setError(""); };

  const handle = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (mode === "signup" && password !== confirm) { setError("Passwords do not match."); return; }
    if (mode === "signup" && password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigateTo("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handle(); };

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <button className="auth-page__brand" onClick={() => navigateTo("/")}>PEN2PRO</button>
      </header>

      <main className="auth-page__main">
        <div className="auth-card">
          <div className="auth-card__logo" aria-hidden="true">P2P</div>
          <h1 className="auth-card__title">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="auth-card__sub">
            {mode === "login"
              ? "Sign in to access your blueprints."
              : "Get started free — no credit card required."}
          </p>

          {error && (
            <div className="auth-card__error" role="alert">{error}</div>
          )}

          <div className="auth-card__fields">
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                placeholder="••••••••"
                disabled={loading}
              />
            </label>

            {mode === "signup" && (
              <label className="auth-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </label>
            )}
          </div>

          <button
            className="auth-card__submit"
            onClick={handle}
            disabled={loading}
          >
            {loading
              ? (mode === "login" ? "Signing in…" : "Creating account…")
              : (mode === "login" ? "Sign In" : "Create Account")}
          </button>

          <p className="auth-card__toggle">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button className="auth-card__toggle-btn" onClick={toggle}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {mode === "login" && (
            <p className="auth-card__guest">
              <button className="auth-card__guest-btn" onClick={() => navigateTo("/starter")}>
                Continue as guest →
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
