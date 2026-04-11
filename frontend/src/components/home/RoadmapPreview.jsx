import { sampleRoadmapData } from "./content";

function RoadmapPreview({ onSampleRoadmap }) {
  return (
    <section id="roadmap-preview" className="section section-muted" aria-labelledby="roadmap-title">
      <div className="container">
        <p className="eyebrow">Roadmap Example Preview</p>
        <h2 id="roadmap-title">See how your roadmap will be structured</h2>
        <p className="section-intro">
          Sample roadmap for a SaaS freelancer tool. Every roadmap is tailored to your specific venture, stage, and market.
        </p>

        {/* Sample Venture Header */}
        <div className="roadmap-header-info">
          <div className="roadmap-header-grid">
            <div className="info-card">
              <p className="info-label">Venture</p>
              <p className="info-value">{sampleRoadmapData.venture}</p>
            </div>
            <div className="info-card">
              <p className="info-label">Niche</p>
              <p className="info-value">{sampleRoadmapData.niche}</p>
            </div>
            <div className="info-card">
              <p className="info-label">Stage</p>
              <p className="info-value">{sampleRoadmapData.stage}</p>
            </div>
            <div className="info-card">
              <p className="info-label">Timeline</p>
              <p className="info-value">{sampleRoadmapData.timeline}</p>
            </div>
          </div>
        </div>

        {/* Detailed Roadmap Sections */}
        <div className="roadmap-sections">
          {sampleRoadmapData.sections.map((section, idx) => (
            <div key={section.title} className="roadmap-section">
              <div className="section-header">
                <span className="section-number">{String(idx + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>
              </div>
              <div className="roadmap-table">
                {section.items.map((item) => (
                  <div key={item.label} className="roadmap-row">
                    <span className="row-label">{item.label}</span>
                    <span className="row-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary center-btn" onClick={onSampleRoadmap}>
          See a Full Sample Roadmap
        </button>
      </div>
    </section>
  );
}

export default RoadmapPreview;
