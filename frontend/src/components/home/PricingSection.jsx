import { planDescriptions, planMarketingStrategies } from "./content";

function PricingSection({ plans, isLoading, onSelectPlan }) {
  return (
    <section id="pricing" className="section section-muted" aria-labelledby="pricing-title">
      <div className="container">
        <p className="eyebrow">Pricing</p>
        <h2 id="pricing-title">Choose the plan that fits your launch stage</h2>
        <p className="section-intro">
          Live pricing is loaded from the backend to keep plan data current.
        </p>

        {isLoading ? (
          <p className="loading-copy" role="status" aria-live="polite">
            Loading pricing plans...
          </p>
        ) : (
          <div className="card-grid card-grid-3 pricing-grid">
            {plans.map((plan) => {
              const isBestValue = plan.name === "Pro";
              const marketingStrategy = planMarketingStrategies[plan.name];
              const priceLabel = plan.display_price || `$${plan.price}`;
              const billingPeriod = plan.billing_period ?? "/month";
              return (
                <article key={plan.name} className={`card pricing-card${isBestValue ? " featured" : ""}`}>
                  {isBestValue ? <span className="best-value">Best Value</span> : null}
                  <h3>{plan.name}</h3>
                  <p className="price">
                    {priceLabel}
                    {billingPeriod ? <span>{billingPeriod}</span> : null}
                  </p>
                  <p className="plan-summary">
                    {planDescriptions[plan.name] || "Flexible roadmap access for your business stage."}
                  </p>
                  {marketingStrategy ? (
                    <div className="plan-strategy" aria-label={`${plan.name} social media marketing strategy`}>
                      <p className="plan-strategy-title">{marketingStrategy.title}</p>
                      <ul className="plan-strategy-list">
                        {marketingStrategy.channels.map((channel) => (
                          <li key={channel}>{channel}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={`btn ${isBestValue ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => onSelectPlan(plan)}
                  >
                    Select {plan.name}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default PricingSection;
