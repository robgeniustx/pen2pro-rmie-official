import "./LandingPage.css";

const trustLogos = ["Stripe-ready", "Founder-first", "Roadmap AI", "Actionable plans"];

function LandingPage({ navigateTo }) {
  return (
    <div className="lp-shell">
      <header className="lp-nav">
        <button className="lp-brand" onClick={() => navigateTo("/")}>PEN2PRO</button>
        <div className="lp-nav-actions">
          <button className="lp-link" onClick={() => navigateTo("/pricing")}>Pricing</button>
          <button className="lp-btn lp-btn--ghost" onClick={() => navigateTo("/")}>View homepage</button>
          <button className="lp-btn" onClick={() => navigateTo("/starter")}>Start free</button>
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <p className="lp-eyebrow">BUSINESS PLANNING FOR EVERYDAY FOUNDERS</p>
          <h1>Launch with a plan that feels premium, clear, and actually usable.</h1>
          <p>
            PEN2PRO turns your business idea into structured outputs: startup requirements, compliance steps,
            launch plan, 90-day operations, and a 12-month scale strategy.
          </p>
          <div className="lp-cta-row">
            <button className="lp-btn" onClick={() => navigateTo("/starter")}>Build my starter blueprint</button>
            <button className="lp-btn lp-btn--ghost" onClick={() => navigateTo("/pricing")}>See plans</button>
          </div>
          <div className="lp-trust-row">
            {trustLogos.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="lp-grid" aria-label="Highlights">
          <article>
            <h3>Structured by default</h3>
            <p>No vague essays. Every result is organized for immediate execution.</p>
          </article>
          <article>
            <h3>Fast founder workflow</h3>
            <p>Answer a focused intake once and get practical recommendations instantly.</p>
          </article>
          <article>
            <h3>Built to scale</h3>
            <p>Go from first launch to team growth with milestones across 30/90/365 days.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
