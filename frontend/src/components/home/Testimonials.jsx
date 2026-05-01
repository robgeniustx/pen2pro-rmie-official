import { testimonials, trustBadges } from "./content";

function Testimonials() {
  return (
    <section id="about" className="section" aria-labelledby="trust-title">
      <div className="container">
        <p className="eyebrow">Trust and Social Proof</p>
        <h2 id="trust-title">Trusted by first-time founders and practical builders</h2>

        <div className="card-grid card-grid-3">
          {testimonials.map((item) => (
            <article key={item.name} className="card testimonial-card">
              <p className="quote">"{item.quote}"</p>
              <p className="person">{item.name}</p>
              <p className="role">{item.title}</p>
            </article>
          ))}
        </div>

        <ul className="badge-row" aria-label="Trust badges">
          {trustBadges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Testimonials;
