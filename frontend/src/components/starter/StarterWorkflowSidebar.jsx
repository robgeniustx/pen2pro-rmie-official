function ProgressHeader({ completion, completedSections, totalSections, currentStep }) {
  return (
    <article className="starter-sidebar-card starter-reveal">
      <h3>Progress Overview</h3>
      <p className="starter-sidebar-card__kicker">Blueprint Progress: {completion}%</p>
      <div className="starter-progress">
        <div className="starter-progress__bar" style={{ width: `${completion}%` }} />
      </div>
      <p className="starter-sidebar-card__meta">{completedSections} of {totalSections} sections completed</p>
      <p className="starter-sidebar-card__meta">Current step: {currentStep}</p>
    </article>
  );
}

function CompletionChecklist({ items }) {
  const iconByState = {
    complete: "✅",
    incomplete: "⏳",
    locked: "🔒",
  };

  return (
    <article className="starter-sidebar-card starter-reveal">
      <h3>Completion Checklist</h3>
      <ul className="starter-checklist">
        {items.map((item) => (
          <li key={item.key} className={`starter-checklist__row is-${item.state}`}>
            <span>{iconByState[item.state]}</span>
            <span>{item.label}</span>
            {item.state === "locked" && <span>Locked</span>}
          </li>
        ))}
      </ul>
    </article>
  );
}

function BusinessSnapshotCard({ values }) {
  return (
    <article className="starter-sidebar-card starter-reveal">
      <h3>Business Snapshot</h3>
      <dl className="starter-snapshot">
        <div><dt>Name</dt><dd>{values.proposedBusinessName || "—"}</dd></div>
        <div><dt>Domain</dt><dd>{values.domainToCheck || "—"}</dd></div>
        <div><dt>Offer</dt><dd>{values.productOrService || "—"}</dd></div>
        <div><dt>Customer</dt><dd>{values.targetCustomer || "—"}</dd></div>
        <div><dt>Access</dt><dd>{values.accessLevel || "free"}</dd></div>
      </dl>
    </article>
  );
}

function NextActionCard({ action }) {
  return (
    <article className="starter-sidebar-card starter-reveal">
      <h3>Recommended Next Action</h3>
      <p>{action}</p>
    </article>
  );
}

function UpgradePromptCard({ accessLevel, onUpgradePro, onSeeElite }) {
  if (accessLevel === "elite") return null;

  return (
    <article className="starter-sidebar-card starter-sidebar-card--upgrade starter-reveal">
      <h3>Unlock Strategist Level</h3>
      <p>{accessLevel === "free" ? "Pro unlocks strategist focus and deeper execution guidance." : "Elite unlocks advanced strategist output and scaling depth."}</p>
      <div className="starter-result__cta-actions">
        {accessLevel === "free" && <button className="starter-button starter-button--secondary" type="button" onClick={onUpgradePro}>Upgrade to Pro</button>}
        <button className="starter-button starter-button--primary" type="button" onClick={onSeeElite}>See Elite</button>
      </div>
    </article>
  );
}

function ProgressSidebar({ values, progress, checklistItems, nextAction, onUpgradePro, onSeeElite }) {
  return (
    <aside className="starter-sidebar">
      <ProgressHeader
        completion={progress.completion}
        completedSections={progress.completedSections}
        totalSections={progress.totalSections}
        currentStep={progress.currentStep}
      />
      <CompletionChecklist items={checklistItems} />
      <BusinessSnapshotCard values={values} />
      <NextActionCard action={nextAction} />
      <UpgradePromptCard accessLevel={values.accessLevel} onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />
    </aside>
  );
}

export default ProgressSidebar;
