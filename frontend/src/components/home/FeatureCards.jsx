import { features } from "./content";

function FeatureCards() {
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <p className="eyebrow">Why PEN2PRO</p>
        <h2 id="features-title">Built for clarity, momentum, and practical execution</h2>
        <p className="section-intro">
          Premium planning structure without complexity overload, so you can move from idea to
          launch with clear priorities and confident decisions.
        </p>

        <div className="card-grid card-grid-3">
          {features.map((feature, index) => (
            <article key={feature.title} className="card feature-card">
              <span className="feature-dot" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <p className="feature-detail">{feature.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;
