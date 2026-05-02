import { useEffect, useState } from "react";

import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import StarterPage from "./pages/StarterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function getCurrentPath() {
  return window.location.pathname || "/";
}

function scrollToHash(hash) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  requestAnimationFrame(() => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function SimplePage({ title, description, ctaLabel, onCta }) {
  return (
    <main className="auth-page__main" style={{ minHeight: "100vh" }}>
      <div className="auth-card">
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__sub">{description}</p>
        {ctaLabel && (
          <button className="auth-card__submit" onClick={onCta}>{ctaLabel}</button>
        )}
      </div>
    </main>
  );
}

function App() {
  const [pathname, setPathname] = useState(getCurrentPath());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setPathname(getCurrentPath());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (target) => {
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` === target) {
      scrollToHash(window.location.hash);
      return;
    }

    window.history.pushState({}, "", target);
    setPathname(getCurrentPath());

    const hash = target.includes("#") ? `#${target.split("#")[1]}` : "";
    scrollToHash(hash);
  };

  if (pathname === "/starter") return <StarterPage navigateTo={navigateTo} />;
  if (pathname === "/launch") return <LandingPage navigateTo={navigateTo} />;
  if (pathname === "/pricing") return <HomePage navigateTo={navigateTo} initialSection="#pricing" currentPath={pathname} />;
  if (pathname === "/login") return <AuthPage navigateTo={navigateTo} mode="login" />;
  if (pathname === "/signup") return <AuthPage navigateTo={navigateTo} mode="signup" />;

  if (pathname === "/dashboard") {
    if (!isAuthenticated) return <AuthPage navigateTo={navigateTo} mode="login" />;
    return <SimplePage title="Founder Dashboard" description="Your business plans, roadmaps, and account activity will appear here." />;
  }

  if (pathname === "/account") {
    if (!isAuthenticated) return <AuthPage navigateTo={navigateTo} mode="login" />;
    return <SimplePage title="Manage Account" description="Update your profile, subscription tier, and billing details." />;
  }

  if (pathname === "/checkout/pro") {
    return <SimplePage title="Pro Checkout" description="Continue to Stripe to activate Pro for advanced roadmap generation." ctaLabel="Back to pricing" onCta={() => navigateTo("/pricing")} />;
  }

  if (pathname === "/checkout/elite") {
    return <SimplePage title="Elite Checkout" description="Continue to Stripe to activate Elite and unlock full founder execution support." ctaLabel="Back to pricing" onCta={() => navigateTo("/pricing")} />;
  }

  return <HomePage navigateTo={navigateTo} currentPath={pathname} />;
}

export default App;
