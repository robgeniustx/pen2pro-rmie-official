import { useEffect, useState } from "react";
import Header from "../components/home/Header";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import FeatureCards from "../components/home/FeatureCards";
import RoadmapPreview from "../components/home/RoadmapPreview";
import Testimonials from "../components/home/Testimonials";
import PricingSection from "../components/home/PricingSection";
import FounderTiers from "../components/home/FounderTiers";
import CTABanner from "../components/home/CTABanner";
import Footer from "../components/home/Footer";
import { fetchBackendStatus, fetchPricingPlans, createFounderCheckout } from "../services/api";
import "./HomePage.css";

function HomePage({ navigateTo, currentPath = "/", initialSection = "" }) {
  const [backendMessage, setBackendMessage] = useState("Loading backend...");
  const [plans, setPlans] = useState([]);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState("");
  const [activeNav, setActiveNav] = useState("#roadmap-preview");

  const navSectionMap = {
    "#roadmap-preview": "#roadmap-preview",
    "#features": "#features",
    "#pricing": "#pricing",
    "#founders": "#founders",
    "#about": "#about",
  };

  useEffect(() => {
    let isMounted = true;

    fetchBackendStatus()
      .then((data) => {
        if (isMounted) {
          setBackendMessage(data.message || "Backend connected");
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendMessage("Backend connection failed");
        }
      });

    fetchPricingPlans()
      .then((data) => {
        if (isMounted) {
          setPlans(Array.isArray(data.plans) ? data.plans : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPlans([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsPricingLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const sectionEntries = Object.entries(navSectionMap);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const activeId = `#${visible[0].target.id}`;
          const matchingHref = sectionEntries.find(([, id]) => id === activeId)?.[0];
          if (matchingHref) {
            setActiveNav(matchingHref);
          }
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -45% 0px",
        threshold: [0.2, 0.35, 0.55],
      },
    );

    sectionEntries.forEach(([, sectionId]) => {
      const section = document.querySelector(sectionId);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);


  useEffect(() => {
    if (currentPath === "/pricing") {
      requestAnimationFrame(() => {
        const pricingSection = document.querySelector("#pricing");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveNav("#pricing");
        }
      });
    }
  }, [currentPath]);
  useEffect(() => {
    if (!initialSection) return;
    const timer = window.setTimeout(() => {
      const element = document.querySelector(initialSection);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      if (initialSection === "#pricing") setActiveNav("#pricing");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialSection]);

  const hasPlans = plans.length > 0;

  const scrollTo = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      const mappedNav = Object.entries(navSectionMap).find(([, sectionId]) => sectionId === id)?.[0];
      if (mappedNav) {
        setActiveNav(mappedNav);
      }
    }
  };

  const handleNavClick = (event, link) => {
    event.preventDefault();

    if (link.href === "#auth") {
      setActiveNav(link.href);
      setPendingAction("Auth buttons hook is ready. Connect Login and Sign Up here.");
      scrollTo("#pricing");
      return;
    }

    scrollTo(link.href);
  };

  const handleStartRoadmap = () => {
    navigateTo("/starter");
  };

  const handleFreeForever = () => {
    navigateTo("/starter");
  };

  const handleSeePricing = () => {
    navigateTo("/pricing");
  };

  const handleSampleRoadmap = () => {
    // TODO: Connect this action to a future sample roadmap demo modal.
    setPendingAction("Sample roadmap preview modal hook is ready.");
  };

  const handleSelectPlan = (plan) => {
    const ctaText = `${plan?.cta_label || ""}`.toLowerCase();
    const planName = `${plan?.name || ""}`.toLowerCase();
    const priceLabel = `${plan?.display_price || ""}`.toLowerCase();
    const badgeText = `${plan?.badge_text || ""}`.toLowerCase();
    const tagline = `${plan?.tagline || ""}`.toLowerCase();
    const starterCtaKeywords = ["start your roadmap", "get started", "start now", "start free", "build my blueprint"];
    const isStarterFlowPlan =
      planName === "starter" ||
      planName.includes("free forever") ||
      priceLabel.includes("free forever") ||
      badgeText.includes("free forever") ||
      tagline.includes("free forever") ||
      starterCtaKeywords.some((keyword) => ctaText.includes(keyword));

    if (isStarterFlowPlan) {
      navigateTo("/starter");
      return;
    }

    // TODO: Connect non-starter plans to auth-aware checkout and onboarding flow.
    setPendingAction(`Plan selected: ${plan.name}. Checkout hook is ready.`);
  };

  const handleFooterCta = () => {
    navigateTo("/starter");
  };

  const handleFounderTierSelect = async (tier) => {
    setPendingAction(`Processing ${tier.name} founder tier checkout...`);
    
    try {
      const checkoutData = await createFounderCheckout(tier.id);
      
      // Redirect to Stripe checkout or show checkout modal
      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
      } else if (checkoutData.sessionId) {
        // Alternative: handle session ID for embedded checkout
        setPendingAction(`Checkout session created: ${tier.name}. Redirecting...`);
        // In production, use Stripe.redirectToCheckout or Stripe hosted checkout
      }
    } catch (error) {
      setPendingAction(`Error: Could not initiate checkout for ${tier.name}. Please try again.`);
      console.error("Founder tier checkout error:", error);
    }
  };

  return (
    <div className="homepage-shell">
      <Header onPrimaryCta={handleStartRoadmap} onNavClick={handleNavClick} activeNav={activeNav} />
      <main>
        <HeroSection
          backendMessage={backendMessage}
          onPrimaryCta={handleStartRoadmap}
          onFreeForeverCta={handleFreeForever}
        />
        <HowItWorks />
        <FeatureCards />
        <RoadmapPreview onSampleRoadmap={handleSampleRoadmap} />
        <Testimonials />
        {hasPlans || isPricingLoading ? (
          <PricingSection plans={plans} isLoading={isPricingLoading} onSelectPlan={handleSelectPlan} />
        ) : (
          <section id="pricing" className="section section-muted" aria-labelledby="pricing-fallback-title">
            <div className="container pricing-fallback">
              <h2 id="pricing-fallback-title">Pricing is temporarily unavailable</h2>
              <p>Please refresh shortly while we reconnect to live plan data.</p>
            </div>
          </section>
        )}
        <FounderTiers onTierSelect={handleFounderTierSelect} />
        <CTABanner onCta={handleFooterCta} />
      </main>
      <Footer />

      <section id="auth" className="sr-only" aria-hidden="true">
        {/* TODO: Add auth buttons/links integration for Login and Sign Up actions. */}
      </section>
      <p className="sr-only" role="status" aria-live="polite">
        {pendingAction}
      </p>
    </div>
  );
}

export default HomePage;
