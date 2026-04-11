import { steps } from "./content";

function HowItWorks() {
  return (
    <section id="how-it-works" className="section section-muted" aria-labelledby="how-title">
      <div className="container">
        <p className="eyebrow">How PEN2PRO Works</p>
        <h2 id="how-title">A practical roadmap flow from idea to launch</h2>
        <p className="section-intro">
          Each stage is designed to keep you moving with clear, structured next actions.
        </p>

        <div className="card-grid card-grid-4">
          {steps.map((step) => (
            <article key={step.title} className="card step-card">
              <span className="icon-badge" aria-hidden="true">
                {step.icon}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
