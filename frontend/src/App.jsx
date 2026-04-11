import { useEffect, useState } from "react";
import heroImage from "./assets/hero.png";

function App() {
  const [message, setMessage] = useState("Checking backend...");
  const [plans, setPlans] = useState([]);
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("launch");
  const [waitlistState, setWaitlistState] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [trafficSource, setTrafficSource] = useState("direct");
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(false);
  const [starterForm, setStarterForm] = useState({
    business_name: "",
    idea: "",
    audience: "",
    revenue_goal: "",
    time_commitment: "",
  });
  const [starterState, setStarterState] = useState({
    loading: false,
    error: "",
  });
  const [starterBlueprint, setStarterBlueprint] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const trackEvent = (eventName, properties = {}) => {
    fetch(`${apiBase}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        source: trafficSource,
        properties,
      }),
    }).catch(() => null);
  };

  const startRoadmapQuestions = ({ source, selectedGoal }) => {
    setGoal(selectedGoal);
    window.location.hash = "waitlist";
    trackEvent("start_roadmap_questions", {
      source,
      selected_goal: selectedGoal,
    });
  };

  const handlePlanSelect = (plan) => {
    trackEvent("pricing_cta_click", {
      plan_name: plan.name,
      cta_label: plan.name === "Starter" ? "Get Started Free" : "Join Upgrade Waitlist",
    });

    if (plan.name === "Starter") {
      window.location.hash = "starter-onboarding";
      trackEvent("starter_onboarding_start", {
        source: "starter_plan",
      });
      return;
    }

    window.location.hash = "waitlist";
    setGoal("upgrade");
  };

  const handleStarterFieldChange = (field) => (event) => {
    setStarterForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitStarterOnboarding = async (event) => {
    event.preventDefault();

    setStarterState({ loading: true, error: "" });
    setStarterBlueprint(null);

    trackEvent("starter_onboarding_submit", {
      has_business_name: Boolean(starterForm.business_name.trim()),
      has_audience: Boolean(starterForm.audience.trim()),
      has_revenue_goal: Boolean(starterForm.revenue_goal.trim()),
    });

    try {
      const response = await fetch(`${apiBase}/api/starter-blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(starterForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to generate your Starter Blueprint.");
      }

      setStarterBlueprint(data.blueprint || null);
      setStarterState({ loading: false, error: "" });
      trackEvent("starter_blueprint_generated", {
        plan: "starter",
      });
    } catch (error) {
      setStarterState({
        loading: false,
        error: error.message || "Unable to generate your Starter Blueprint.",
      });

      trackEvent("starter_blueprint_error", {
        error: error.message || "unknown",
      });
    }
  };

  const submitWaitlist = async (event) => {
    event.preventDefault();
    setWaitlistState({ loading: true, message: "", error: "" });

    try {
      const response = await fetch(`${apiBase}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, goal, source: "homepage" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setWaitlistState({
        loading: false,
        message: data.already_joined
          ? "You are already on the PEN2PRO waitlist."
          : "Success. You are now on the PEN2PRO waitlist.",
        error: "",
      });

      trackEvent("waitlist_submit_success", {
        goal,
        already_joined: data.already_joined,
      });

      setEmail("");
    } catch (error) {
      setWaitlistState({
        loading: false,
        message: "",
        error: error.message || "Unable to join the waitlist.",
      });

      trackEvent("waitlist_submit_error", {
        goal,
        error: error.message || "unknown",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const detectedSource =
      params.get("utm_source") || params.get("ref") || document.referrer || "direct";
    setTrafficSource(detectedSource);

    fetch(`${apiBase}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend connection failed"));

    fetch(`${apiBase}/api/pricing`)
      .then((res) => res.json())
      .then((data) => setPlans(data.plans))
      .catch(() => setPlans([]));

    fetch(`${apiBase}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "landing_view",
        source: detectedSource,
        properties: { page: "homepage" },
      }),
    }).catch(() => null);
  }, [apiBase]);

  return (
    <div style={{ background: "#f5f7f2", minHeight: "100vh", color: "#162312" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(245, 247, 242, 0.95)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid #dbe4d2",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <strong style={{ letterSpacing: "0.8px" }}>PEN2PRO</strong>
          <nav style={{ display: "flex", gap: "16px", fontWeight: 600 }}>
            <a href="#starter-onboarding" style={{ color: "#305820", textDecoration: "none" }}>
              Free Onboarding
            </a>
            <a href="#pricing" style={{ color: "#305820", textDecoration: "none" }}>
              Pricing
            </a>
            <a href="#waitlist" style={{ color: "#305820", textDecoration: "none" }}>
              Join Waitlist
            </a>
          </nav>
        </div>
      </header>

      <section
        style={{
          padding: "56px 24px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ letterSpacing: "2px", fontSize: "12px", fontWeight: 700, color: "#3f6f2f" }}>
            PEN2PRO RMIE BUSINESS BUILDER
          </p>
          <h1 style={{ fontSize: "44px", margin: "16px 0 12px", lineHeight: 1.05 }}>
            Launch a real business in 30 days with AI-guided execution.
          </h1>
          <p style={{ fontSize: "18px", margin: "0 0 24px", color: "#30432a" }}>
            PEN2PRO helps aspiring founders validate ideas, build offers, and ship
            revenue-focused plans without getting stuck in theory.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <a
              href="#waitlist"
              onClick={(event) => {
                event.preventDefault();
                trackEvent("hero_cta_click", {
                  cta_label: "Start your roadmap",
                  location: "hero",
                });
                startRoadmapQuestions({ source: "hero", selectedGoal: "launch" });
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#2d6b25",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Start your roadmap
            </a>
            <a
              href="#pricing"
              onClick={() =>
                trackEvent("hero_cta_click", {
                  cta_label: "See Plans",
                  location: "hero",
                })
              }
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #9bbb8e",
                color: "#214019",
                textDecoration: "none",
                fontWeight: 700,
                background: "#eef5e8",
              }}
            >
              See Plans
            </a>
          </div>
          <p style={{ marginTop: "14px", color: "#406236", fontWeight: 600 }}>
            Trusted workflow for idea validation, monetization planning, and launch execution.
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#e8f2dd",
              color: "#204314",
              fontWeight: 600,
              marginTop: "16px",
            }}
          >
            Platform status: {message}
          </div>
        </div>

        <img
          src={heroImage}
          alt="PEN2PRO dashboard preview showing business planning and monetization milestones"
          style={{
            width: "100%",
            maxWidth: "520px",
            borderRadius: "22px",
            border: "1px solid #d4e1c9",
            boxShadow: "0 14px 36px rgba(33, 64, 25, 0.16)",
            justifySelf: "center",
          }}
        />
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "4px 24px 22px",
        }}
      >
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #d4e3c8",
            background: "#f0f7e9",
            padding: "18px",
          }}
        >
          <h2 style={{ fontSize: "25px", margin: "0 0 8px" }}>Business Launch Execution Paths</h2>
          <p style={{ marginBottom: "10px", color: "#395633" }}>
            PEN2PRO supports idea validation, monetization strategy, AI business planning, and daily founder execution.
          </p>
          <p style={{ margin: 0, color: "#2f4a28" }}>
            Compare plans in <a href="#pricing">Pricing</a> or start your conversion path now in <a href="#waitlist">Join Waitlist</a>.
          </p>
        </div>
      </section>

      <section
        id="starter-onboarding"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "8px 24px 20px",
        }}
      >
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(120deg, #f4f9ee, #e6f2da)",
            border: "1px solid #cfe0bf",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "30px", margin: "0 0 8px" }}>
            Starter / Free Forever Onboarding
          </h2>
          <p style={{ color: "#375031", marginBottom: "18px" }}>
            Share your business idea and PEN2PRO will generate your Starter Business Blueprint in seconds.
          </p>

          <form onSubmit={submitStarterOnboarding} style={{ display: "grid", gap: "10px", maxWidth: "680px" }}>
            <input
              type="text"
              placeholder="Business name (optional)"
              aria-label="Business name"
              value={starterForm.business_name}
              onChange={handleStarterFieldChange("business_name")}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #9fb78f",
                fontSize: "16px",
              }}
            />
            <textarea
              required
              placeholder="What business idea do you want to launch?"
              aria-label="Business idea"
              rows={4}
              value={starterForm.idea}
              onChange={handleStarterFieldChange("idea")}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #9fb78f",
                fontSize: "16px",
                resize: "vertical",
              }}
            />
            <input
              type="text"
              placeholder="Who is your target audience? (optional)"
              aria-label="Target audience"
              value={starterForm.audience}
              onChange={handleStarterFieldChange("audience")}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #9fb78f",
                fontSize: "16px",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="First 30-day revenue goal (optional)"
                aria-label="Revenue goal"
                value={starterForm.revenue_goal}
                onChange={handleStarterFieldChange("revenue_goal")}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #9fb78f",
                  fontSize: "16px",
                }}
              />
              <input
                type="text"
                placeholder="Weekly time commitment (optional)"
                aria-label="Time commitment"
                value={starterForm.time_commitment}
                onChange={handleStarterFieldChange("time_commitment")}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #9fb78f",
                  fontSize: "16px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={starterState.loading}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#1f5a19",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              {starterState.loading ? "Generating Blueprint..." : "Generate Starter Blueprint"}
            </button>
          </form>

          {starterState.error && (
            <p style={{ marginTop: "12px", color: "#8e1d12", fontWeight: 700 }}>
              {starterState.error}
            </p>
          )}

          {starterBlueprint && (
            <div
              style={{
                marginTop: "20px",
                borderRadius: "16px",
                border: "1px solid #cadec6",
                background: "#ffffff",
                padding: "18px",
                display: "grid",
                gap: "14px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#4a6742", letterSpacing: "1px" }}>
                  {starterBlueprint.plan}
                </p>
                <h3 style={{ margin: "6px 0", fontSize: "24px" }}>{starterBlueprint.business_name}</h3>
                <p style={{ margin: 0, color: "#30432a" }}>{starterBlueprint.headline}</p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px" }}>Positioning</h4>
                <p style={{ margin: "0 0 4px" }}><strong>Problem:</strong> {starterBlueprint.positioning.problem}</p>
                <p style={{ margin: "0 0 4px" }}><strong>Audience:</strong> {starterBlueprint.positioning.audience}</p>
                <p style={{ margin: 0 }}><strong>Promise:</strong> {starterBlueprint.positioning.promise}</p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px" }}>Starter Offer</h4>
                <p style={{ margin: "0 0 4px" }}><strong>Name:</strong> {starterBlueprint.offer.name}</p>
                <p style={{ margin: "0 0 4px" }}><strong>Description:</strong> {starterBlueprint.offer.description}</p>
                <p style={{ margin: 0 }}><strong>Price:</strong> {starterBlueprint.offer.starter_price}</p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px" }}>30-Day Execution Plan</h4>
                <ol style={{ margin: 0, paddingLeft: "20px", color: "#253a1e" }}>
                  {starterBlueprint.execution_plan.map((step) => (
                    <li key={step} style={{ marginBottom: "6px" }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px" }}>Starter Metrics</h4>
                <p style={{ margin: "0 0 4px" }}><strong>Revenue Target:</strong> {starterBlueprint.metrics.revenue_target}</p>
                <p style={{ margin: "0 0 4px" }}><strong>Time Commitment:</strong> {starterBlueprint.metrics.time_commitment}</p>
                <p style={{ margin: 0 }}><strong>North Star:</strong> {starterBlueprint.metrics.north_star}</p>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e1ead8",
                  paddingTop: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "12px",
                }}
              >
                <div style={{ border: "1px solid #d4e3c8", borderRadius: "12px", padding: "12px", background: "#f8fcf4" }}>
                  <h4 style={{ margin: "0 0 6px" }}>Upgrade to Pro</h4>
                  <p style={{ margin: "0 0 6px", color: "#35522f" }}>{starterBlueprint.upgrade_path.pro.when_to_upgrade}</p>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#214019" }}>Unlocks:</p>
                  <ul style={{ margin: "0 0 10px", paddingLeft: "20px" }}>
                    {starterBlueprint.upgrade_path.pro.unlocks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      window.location.hash = "waitlist";
                      setGoal("upgrade");
                      trackEvent("starter_upgrade_path_click", { tier: "pro" });
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#1f5a19",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {starterBlueprint.upgrade_path.pro.cta}
                  </button>
                </div>

                <div style={{ border: "1px solid #d4e3c8", borderRadius: "12px", padding: "12px", background: "#f8fcf4" }}>
                  <h4 style={{ margin: "0 0 6px" }}>Upgrade to Elite</h4>
                  <p style={{ margin: "0 0 6px", color: "#35522f" }}>{starterBlueprint.upgrade_path.elite.when_to_upgrade}</p>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#214019" }}>Unlocks:</p>
                  <ul style={{ margin: "0 0 10px", paddingLeft: "20px" }}>
                    {starterBlueprint.upgrade_path.elite.unlocks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      window.location.hash = "waitlist";
                      setGoal("upgrade");
                      trackEvent("starter_upgrade_path_click", { tier: "elite" });
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {starterBlueprint.upgrade_path.elite.cta}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        id="waitlist"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "12px 24px 32px",
        }}
      >
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(120deg, #f1f8eb, #e5f0dd)",
            border: "1px solid #cfe0bf",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "30px", margin: "0 0 8px" }}>Join the PEN2PRO Waitlist</h2>
          <p style={{ color: "#375031", marginBottom: "18px" }}>
            Start your business development test questions, get launch checklists, and unlock priority onboarding.
          </p>
          <form onSubmit={submitWaitlist} style={{ display: "grid", gap: "10px", maxWidth: "540px" }}>
            <input
              type="email"
              required
              placeholder="you@business.com"
              aria-label="Email address"
              autoComplete="email"
              value={email}
              onFocus={() => {
                if (!hasTrackedFormStart) {
                  trackEvent("waitlist_form_start", { placement: "homepage_waitlist" });
                  setHasTrackedFormStart(true);
                }
              }}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #9fb78f",
                fontSize: "16px",
              }}
            />
            <select
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              aria-label="Business goal"
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #9fb78f",
                fontSize: "16px",
                background: "#fff",
              }}
            >
              <option value="launch">I want to launch my first offer</option>
              <option value="monetize">I want to monetize faster</option>
              <option value="upgrade">I need a full execution system</option>
              <option value="start-free">I want to get started free</option>
            </select>
            <button
              type="submit"
              disabled={waitlistState.loading}
              onClick={() => trackEvent("waitlist_cta_click", { cta_label: "Get Priority Access", goal })}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#1f5a19",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {waitlistState.loading ? "Submitting..." : "Get Priority Access"}
            </button>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#4a6742" }}>
              No spam. Only practical launch guidance and product access updates from PEN2PRO.
            </p>
          </form>

          {waitlistState.message && (
            <p style={{ marginTop: "10px", color: "#1f5a19", fontWeight: 700 }}>
              {waitlistState.message}
            </p>
          )}
          {waitlistState.error && (
            <p style={{ marginTop: "10px", color: "#8e1d12", fontWeight: 700 }}>
              {waitlistState.error}
            </p>
          )}
        </div>
      </section>

      <section
        id="pricing"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "10px 24px 80px",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "8px" }}>Pricing Plans</h2>
        <p style={{ textAlign: "center", marginBottom: "28px", color: "#395633" }}>
          Start free, prove traction, then scale with guided business systems.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: "#ffffff",
                border: "1px solid #d6e2cc",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(39, 68, 35, 0.08)",
              }}
            >
              <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
                {plan.name}
              </h3>

              <p
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  margin: "0 0 18px",
                }}
              >
                ${plan.price}
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    color: "#6b7280",
                  }}
                >
                  /month
                </span>
              </p>

              <p style={{ color: "#4b5563", marginBottom: "20px" }}>
                {plan.name === "Starter" &&
                  "Start building with core business planning and launch structure."}
                {plan.name === "Pro" &&
                  "For founders who want faster monetization and weekly execution prompts."}
                {plan.name === "Elite" &&
                  "For operators scaling aggressively with full PEN2PRO implementation support."}
              </p>

              <button
                onClick={() => handlePlanSelect(plan)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#111827",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {plan.name === "Starter" ? "Get Started Free" : "Join Upgrade Waitlist"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;