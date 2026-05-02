import { useEffect, useState } from "react";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import StarterPage from "./pages/StarterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import WaitlistPage from "./pages/WaitlistPage.jsx";
import Navbar from "./components/Navbar.jsx";
import { isAuthenticated } from "./lib/auth";

function getCurrentPath() { return window.location.pathname || "/"; }

export default function App() {
  const [pathname, setPathname] = useState(getCurrentPath());
  const navigateTo = (target) => { window.history.pushState({}, "", target); setPathname(getCurrentPath()); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => { const onPop = () => setPathname(getCurrentPath()); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  const protectedPage = (node) => (isAuthenticated() ? node : <LoginPage navigateTo={navigateTo} />);

  let page = <HomePage navigateTo={navigateTo} currentPath={pathname} />;
  if (pathname === "/starter") page = <StarterPage navigateTo={navigateTo} />;
  if (pathname === "/launch") page = <LandingPage navigateTo={navigateTo} />;
  if (pathname === "/pricing") page = <PricingPage navigateTo={navigateTo} />;
  if (pathname === "/waitlist") page = <WaitlistPage navigateTo={navigateTo} />;
  if (pathname === "/login") page = <LoginPage navigateTo={navigateTo} />;
  if (pathname === "/signup") page = <SignupPage navigateTo={navigateTo} />;
  if (pathname === "/dashboard") page = protectedPage(<DashboardPage navigateTo={navigateTo} />);
  if (pathname === "/account") page = protectedPage(<AccountPage navigateTo={navigateTo} />);

  return <div className="auth-page"><Navbar navigateTo={navigateTo} />{page}</div>;
}
