function CTABanner({ onCta }) {
  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta-banner">
          <h2 id="cta-title">Ready to turn your idea into action?</h2>
          <button type="button" className="btn btn-primary" onClick={onCta}>
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;
