import { useEffect, useMemo, useState } from "react";

/* =========================
   Helpers
========================= */

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasRenderableValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function formatLabel(key) {
  return String(key)
    .replace(/[_-]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   Component
========================= */

function StarterBlueprintResult({
  response,
  blueprint,
  intakeValues,
  onUpgradePro,
  onSeeElite,
  onStartAnother,
}) {
  const source = response || blueprint || {};
  const blueprintData = isPlainObject(source) ? source : {};

  const proposedBusinessName = (intakeValues?.proposedBusinessName || "").trim();
  const selectedBrandName = (intakeValues?.selectedBrandName || "").trim();
  const resolvedBusinessName =
    proposedBusinessName || selectedBrandName || "Your Company Name";

  const generatedDate = new Date().toLocaleDateString();
  const businessIdea = (intakeValues?.businessIdea || "").trim();

  const strategist = blueprintData.ai_strategist_recommendation || {};

  const handlePrintBlueprint = () => {
    if (!proposedBusinessName && !selectedBrandName) {
      alert("Enter a business name before printing.");
      return;
    }
    window.print();
  };

  const handleEmailBlueprint = () => {
    const subject = `Your PEN2PRO™ Blueprint for ${resolvedBusinessName}`;
    const body = `Business: ${resolvedBusinessName}\nIdea: ${businessIdea}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="starter-result">
      {/* HEADER */}
      <div className="starter-result__header">
        <h2>Blueprint for: {resolvedBusinessName}</h2>
        <p>Date: {generatedDate}</p>
        <p>Idea: {businessIdea || "Not provided"}</p>
      </div>

      {/* STRATEGIST */}
      {hasRenderableValue(strategist) && (
        <section className="starter-result__card">
          <h3>10M Strategist Engine</h3>

          {Object.entries(strategist).map(([key, value]) => (
            <p key={key}>
              <strong>{formatLabel(key)}:</strong> {String(value)}
            </p>
          ))}
        </section>
      )}

      {/* CTA */}
      <div className="starter-result__cta-block">
        <p>Ready for deeper strategy?</p>

        <div className="starter-result__cta-actions">
          <button onClick={handlePrintBlueprint}>
            Print / Save PDF
          </button>

          <button onClick={handleEmailBlueprint}>
            Email Blueprint
          </button>

          <button onClick={onUpgradePro}>
            Upgrade to Pro
          </button>

          <button onClick={onSeeElite}>
            See Elite
          </button>

          {typeof onStartAnother === "function" && (
            <button onClick={onStartAnother}>
              Start Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StarterBlueprintResult;
