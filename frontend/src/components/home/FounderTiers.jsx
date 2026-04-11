import { founderGuarantee, founderPillars, founderTiers } from "./content";

function FounderTiers({ onTierSelect }) {
  return (
    <section id="founders" className="section section-founder" aria-labelledby="founders-title">
      <div className="container">
        <p className="eyebrow">Founder Options</p>
        <h2 id="founders-title">Three founder tiers. One-time payment. Lifetime value.</h2>
        <p className="section-intro">
          Every founder tier is a one-time investment with progressive support by venture complexity,
          lifetime service access, and free access to all new platform features.
        </p>

        <ul className="founder-pillars" aria-label="Included founder infrastructure areas">
          {founderPillars.map((pillar) => (
            <li key={pillar}>{pillar}</li>
          ))}
        </ul>

        <div className="card-grid card-grid-3 founder-tier-grid">
          {founderTiers.map((tier) => (
            <article key={tier.name} className={`card founder-tier${tier.featured ? " founder-tier-featured" : ""}`}>
              {tier.badge ? <p className="founder-badge">{tier.badge}</p> : null}
              <h3>{tier.name}</h3>
              <p className="founder-price">{tier.price}<span>/one-time</span></p>
              {tier.entityTypes && (
                <p className="founder-entity-types">
                  <strong>Supports:</strong> {tier.entityTypes}
                </p>
              )}
              <ul className="founder-benefits">
                {tier.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <button type="button" className={`btn ${tier.featured ? "btn-primary" : "btn-secondary"}`} onClick={() => onTierSelect(tier)}>
                {tier.cta}
              </button>
            </article>
          ))}
        </div>

        <article className="card founder-guarantee" aria-label="Founder guarantee">
          <h3>Our Founder Guarantee</h3>
          <p>
            We do not guarantee income. We guarantee infrastructure delivery, execution support,
            and continuous platform improvements for committed founders.
          </p>
          <ul className="founder-benefits">
            {founderGuarantee.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default FounderTiers;
