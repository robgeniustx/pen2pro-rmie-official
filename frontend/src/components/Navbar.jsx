import { isAuthenticated, logoutUser } from "../lib/auth";

export default function Navbar({ navigateTo }) {
  const loggedIn = isAuthenticated();
  const handleLogout = () => { logoutUser(); navigateTo("/login"); };

  return (
    <header className="auth-page__header">
      <nav className="starter-page__nav">
        <button className="starter-page__brand" onClick={() => navigateTo("/")}>PEN2PRO</button>
        <div className="starter-page__nav-links">
          <button onClick={() => navigateTo("/starter?tier=free")}>Starter</button>
          <button onClick={() => navigateTo("/pricing")}>Pricing</button>
          {!loggedIn && <button onClick={() => navigateTo("/waitlist")}>Join Waitlist</button>}
          {!loggedIn && <button onClick={() => navigateTo("/login")}>Login</button>}
          {!loggedIn && <button onClick={() => navigateTo("/signup")}>Sign Up</button>}
          {loggedIn && <button onClick={() => navigateTo("/dashboard")}>Dashboard</button>}
          {loggedIn && <button onClick={() => navigateTo("/account")}>Account</button>}
          {loggedIn && <button onClick={handleLogout}>Logout</button>}
        </div>
      </nav>
    </header>
  );
}
