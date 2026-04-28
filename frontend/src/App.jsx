import { useEffect, useState } from "react";

import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import StarterPage from "./pages/StarterPage.jsx";

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

function App() {
  const [pathname, setPathname] = useState(getCurrentPath());

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

  if (pathname === "/starter") {
    return <StarterPage navigateTo={navigateTo} />;
  }

  return <HomePage navigateTo={navigateTo} currentPath={pathname} />;
}

export default App;