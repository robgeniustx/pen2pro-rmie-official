import { trustHighlights } from "./content";

function HeroSection({ backendMessage, onPrimaryCta, onSecondaryCta }) {
  return (
    <section id="top" className="hero-section section" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">PEN2PRO ROADMAP PLATFORM</p>
          <h1 id="hero-title">
            Turn your idea into an actionable, source-backed business roadmap
          </h1>
          <p className="section-intro">
            Get clarity, structure, and launch support-no MBA needed.
          </p>

          <div className="hero-actions" role="group" aria-label="Hero actions">
            <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
              Start Your Roadmap
            </button>
            <button type="button" className="btn btn-secondary" onClick={onSecondaryCta}>
              How It Works
            </button>
          </div>

          <ul className="trust-row" aria-label="Platform highlights">
            {trustHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <aside className="hero-panel" aria-label="Platform preview and status">
          <p className="panel-label">Live Status</p>
          <p className="status-pill">Backend: {backendMessage}</p>
          <div className="mockup-grid" aria-hidden="true">
            <div className="mock-card">
              <span>Roadmap Confidence</span>
              <strong>86%</strong>
            </div>
            <div className="mock-card">
              <span>Next Milestone</span>
              <strong>Customer Discovery</strong>
            </div>
            <div className="mock-card wide">
              <span>Source Coverage</span>
              <strong>7 referenced insights linked</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default HeroSection;
