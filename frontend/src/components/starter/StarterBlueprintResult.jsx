import { useEffect, useMemo, useState } from "react";

const PHASE_ORDER = ["Foundation", "First Money", "Growth", "Scale"];

const BLUEPRINT_PHASE_MAP = {
  business_snapshot: "Foundation",
  startup_requirements: "Foundation",
  licenses_and_compliance: "Foundation",
  tools_and_software: "Foundation",
  pricing_strategy: "First Money",
  launch_plan_30_days: "First Money",
  operations_plan_90_days: "Growth",
  scale_plan_12_months: "Scale",
  risk_flags: "Scale",
  sources: "Scale",
};

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

function resolveBlueprintData(response, blueprint) {
  const candidates = [
    blueprint,
    response?.blueprint,
    response?.data?.blueprint,
    response?.data,
    response?.result?.blueprint,
    response?.result,
    response,
  ];

  return candidates.find((entry) => isPlainObject(entry)) || {};
}

function getStringValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeTaskCandidate(rawItem, sectionKey, index) {
  if (typeof rawItem === "string") {
    return {
      id: `${sectionKey}-${index}-${rawItem}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: rawItem,
      description: "",
      priority: "Medium",
      estimatedTime: "30-60 min",
      link: "",
    };
  }

  if (!isPlainObject(rawItem)) {
    return null;
  }

  const title = getStringValue(
    rawItem.task,
    rawItem.title,
    rawItem.step,
    rawItem.action,
    rawItem.name,
    rawItem.requirement,
    rawItem.checkpoint,
    rawItem.item,
    `${formatLabel(sectionKey)} task ${index + 1}`
  );

  const description = getStringValue(
    rawItem.description,
    rawItem.details,
    rawItem.why,
    rawItem.notes,
    rawItem.context,
    rawItem.summary
  );

  return {
    id: `${sectionKey}-${index}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    description,
    priority: getStringValue(rawItem.priority, rawItem.urgency, rawItem.impact) || "Medium",
    estimatedTime: getStringValue(
      rawItem.estimated_time,
      rawItem.estimatedTime,
      rawItem.time,
      rawItem.duration,
      rawItem.effort
    ) || "30-60 min",
    link: getStringValue(rawItem.link, rawItem.url, rawItem.external_link, rawItem.source),
  };
}

function buildTasksForSection(sectionKey, sectionValue) {
  const taskCandidates = [];

  if (Array.isArray(sectionValue)) {
    sectionValue.forEach((item, index) => {
      taskCandidates.push(normalizeTaskCandidate(item, sectionKey, index));
    });
  } else if (isPlainObject(sectionValue)) {
    if (Array.isArray(sectionValue.tasks)) {
      sectionValue.tasks.forEach((item, index) => {
        taskCandidates.push(normalizeTaskCandidate(item, sectionKey, index));
      });
    } else {
      Object.entries(sectionValue).forEach(([key, value], index) => {
        if (Array.isArray(value)) {
          value.forEach((item, nestedIndex) => {
            taskCandidates.push(normalizeTaskCandidate(item, `${sectionKey}-${key}`, nestedIndex));
          });
          return;
        }

        if (hasRenderableValue(value)) {
          taskCandidates.push(
            normalizeTaskCandidate(
              isPlainObject(value)
                ? { ...value, title: value.title || formatLabel(key) }
                : { title: formatLabel(key), description: String(value) },
              sectionKey,
              index
            )
          );
        }
      });
    }
  } else if (typeof sectionValue === "string" && sectionValue.trim()) {
    taskCandidates.push(normalizeTaskCandidate(sectionValue, sectionKey, 0));
  }

  return taskCandidates.filter(Boolean);
}

function buildTaskEngine(blueprintData) {
  const allTasks = [];

  Object.entries(blueprintData).forEach(([sectionKey, sectionValue]) => {
    if (sectionKey === "ai_strategist_recommendation") {
      return;
    }

    const phase = BLUEPRINT_PHASE_MAP[sectionKey] || "Foundation";
    const sectionTasks = buildTasksForSection(sectionKey, sectionValue).map((task) => ({
      ...task,
      phase,
      sectionKey,
    }));

    allTasks.push(...sectionTasks);
  });

  return PHASE_ORDER.reduce((accumulator, phase) => {
    accumulator[phase] = allTasks.filter((task) => task.phase === phase);
    return accumulator;
  }, {});
}

function StarterBlueprintResult({
  response,
  blueprint,
  intakeValues,
  onUpgradePro,
  onSeeElite,
  onStartAnother,
}) {
  const blueprintData = useMemo(() => resolveBlueprintData(response, blueprint), [response, blueprint]);

  const proposedBusinessName = (intakeValues?.proposedBusinessName || "").trim();
  const selectedBrandName = (intakeValues?.selectedBrandName || "").trim();
  const resolvedBusinessName =
    proposedBusinessName || selectedBrandName || getStringValue(blueprintData.business_name) || "Your Company Name";

  const generatedDate = new Date().toLocaleDateString();
  const businessIdea = (intakeValues?.businessIdea || "").trim();

  const strategist = isPlainObject(blueprintData.ai_strategist_recommendation)
    ? blueprintData.ai_strategist_recommendation
    : {};

  const strategistPanels = [
    {
      label: "Next Best Move",
      value: getStringValue(strategist.next_best_move, strategist.nextBestMove),
      lockedBy: null,
    },
    {
      label: "Fastest Path to First $1K",
      value: getStringValue(strategist.fastest_path_to_first_1k, strategist.fastestPathToFirst1k),
      lockedBy: null,
    },
    {
      label: "What to Avoid",
      value: getStringValue(strategist.what_to_avoid, strategist.whatToAvoid),
      lockedBy: null,
    },
    {
      label: "Execution Plan",
      value: getStringValue(strategist.execution_plan, strategist.executionPlan),
      lockedBy: "pro",
    },
    {
      label: "Strategist Insight",
      value: getStringValue(strategist.strategist_insight, strategist.strategistInsight),
      lockedBy: "elite",
    },
  ];

  const accessTier = getStringValue(intakeValues?.accessTier).toLowerCase() || "free";
  const taskPhases = useMemo(() => buildTaskEngine(blueprintData), [blueprintData]);
  const allTasks = useMemo(() => PHASE_ORDER.flatMap((phase) => taskPhases[phase] || []), [taskPhases]);

  const storageKey = useMemo(
    () => `starterBlueprintTasks:${resolvedBusinessName}:${getStringValue(businessIdea, "default")}`,
    [resolvedBusinessName, businessIdea]
  );

  const [completedTaskIds, setCompletedTaskIds] = useState([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      setCompletedTaskIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setCompletedTaskIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCompletedTaskIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedTaskIds));
  }, [completedTaskIds, storageKey]);

  const completedCount = allTasks.filter((task) => completedTaskIds.includes(task.id)).length;
  const progressPercent = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0;

  const nextAction = allTasks.find((task) => !completedTaskIds.includes(task.id));

  const handleTaskToggle = (taskId) => {
    setCompletedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    );
  };

  const handlePrintBlueprint = () => {
    if (!proposedBusinessName && !selectedBrandName) {
      alert("Enter a business name before printing.");
      return;
    }
    window.print();
  };

  const handleEmailBlueprint = () => {
    const subject = `Your PEN2PRO™ Blueprint for ${resolvedBusinessName}`;
    const body = [
      `Business: ${resolvedBusinessName}`,
      `Idea: ${businessIdea || "Not provided"}`,
      `Progress: ${progressPercent}% complete`,
      nextAction ? `Next action: ${nextAction.title}` : "All core tasks complete.",
    ].join("\n");

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="starter-result">
      <header className="starter-result__header">
        <p className="starter-result__eyebrow">Blueprint Header</p>
        <h2 className="starter-result__title">{resolvedBusinessName}</h2>
        <p className="starter-result__subtitle">Generated by PEN2PRO™</p>
        <p className="starter-result__meta">Business idea: {businessIdea || "Not provided"}</p>
        <p className="starter-result__meta">Date generated: {generatedDate}</p>
      </header>

      <section className="starter-result__strategist-card">
        <h3>10M Strategist Recommendation</h3>
        {strategistPanels.map((panel) => {
          const isProLocked = panel.lockedBy === "pro" && accessTier === "free";
          const isEliteLocked = panel.lockedBy === "elite" && ["free", "pro"].includes(accessTier);
          const isLocked = isProLocked || isEliteLocked;

          return (
            <p key={panel.label} className="starter-result__meta">
              <strong>{panel.label}:</strong>{" "}
              {isLocked ? (
                <>
                  Locked in {panel.lockedBy === "pro" ? "Pro" : "Elite"} —
                  {panel.lockedBy === "pro" ? " upgrade to Pro to unlock." : " see Elite for full insight."}
                </>
              ) : (
                panel.value || "Not generated in this response."
              )}
            </p>
          );
        })}
      </section>

      <section className="starter-result__tracker" aria-label="Blueprint execution tracker">
        <div className="starter-result__tracker-row">
          <p>
            <strong>Task Engine Progress:</strong> {completedCount}/{allTasks.length} tasks complete
          </p>
          <p>
            <strong>Next Recommended Action:</strong> {nextAction ? nextAction.title : "All listed tasks complete"}
          </p>
        </div>
        <div className="starter-result__progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <div className="starter-result__phases">
        {PHASE_ORDER.map((phase) => {
          const phaseTasks = taskPhases[phase] || [];

          return (
            <section key={phase} className="starter-result__card">
              <h3>{phase}</h3>
              {phaseTasks.length === 0 ? (
                <p className="starter-result__empty">No tasks generated for this phase yet.</p>
              ) : (
                <ul className="starter-result__task-list">
                  {phaseTasks.map((task) => {
                    const isComplete = completedTaskIds.includes(task.id);

                    return (
                      <li key={task.id} className={`starter-result__task ${isComplete ? "is-complete" : ""}`}>
                        <label className="starter-result__task-main">
                          <input
                            type="checkbox"
                            checked={isComplete}
                            onChange={() => handleTaskToggle(task.id)}
                          />
                          <span className="starter-result__task-title">{task.title}</span>
                        </label>

                        {task.description && <p className="starter-result__task-description">{task.description}</p>}

                        <div className="starter-result__task-meta">
                          <span>Priority: {task.priority}</span>
                          <span>Estimated time: {task.estimatedTime}</span>
                          {task.link && (
                            <a href={task.link} target="_blank" rel="noreferrer">
                              Open resource
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className="starter-result__cta-block">
        <p className="starter-result__cta-copy">Keep momentum — export this blueprint or unlock deeper execution support.</p>
        <div className="starter-result__cta-actions">
          <button className="starter-button starter-button--secondary" onClick={handlePrintBlueprint}>
            Print / Save PDF
          </button>
          <button className="starter-button starter-button--secondary" onClick={handleEmailBlueprint}>
            Email Blueprint
          </button>
          <button className="starter-button starter-button--primary" onClick={onUpgradePro}>
            Upgrade to Pro
          </button>
          <button className="starter-button starter-button--primary" onClick={onSeeElite}>
            See Elite
          </button>
          {typeof onStartAnother === "function" && (
            <button className="starter-button starter-button--secondary" onClick={onStartAnother}>
              Start Another Blueprint
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default StarterBlueprintResult;
