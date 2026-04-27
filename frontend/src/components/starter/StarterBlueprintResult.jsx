import { useEffect, useMemo, useState } from "react";

const PHASES = [
  { id: "foundation", label: "Phase 1: Foundation (Day 0–3)" },
  { id: "firstMoney", label: "Phase 2: First Money (Day 1–14)" },
  { id: "growth", label: "Phase 3: Growth (Day 15–30)" },
  { id: "scale", label: "Phase 4: Scale (Day 30–90)" },
];

const HIGH_PRIORITY_HINTS = ["top", "first", "launch", "customer", "offer", "pricing", "revenue", "risk", "legal"];

const PHASE_HINTS = {
  foundation: ["venture", "business_snapshot", "requirements", "license", "compliance", "risk", "brand", "customer"],
  firstMoney: ["starter", "pricing", "money", "launch", "action", "tools", "software"],
  growth: ["pro", "operations", "30", "90", "growth"],
  scale: ["elite", "scale", "12", "automation", "expansion"],
};

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasRenderableValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeBlueprint(response) {
  if (!response) return {};
  if (isPlainObject(response.blueprint) && hasRenderableValue(response.blueprint)) return response.blueprint;
  if (isPlainObject(response.data) && isPlainObject(response.data.blueprint)) return response.data.blueprint;
  if (isPlainObject(response.data) && hasRenderableValue(response.data)) return response.data;
  if (isPlainObject(response.result) && hasRenderableValue(response.result)) return response.result;

  const topLevelBlueprintKeys = [
    "ventureSummary",
    "starterPlan",
    "proPlan",
    "elitePlan",
    "upgradeHooks",
    "business_snapshot",
    "startup_requirements",
    "licenses_and_compliance",
    "tools_and_software",
    "pricing_strategy",
    "launch_plan_30_days",
    "operations_plan_90_days",
    "scale_plan_12_months",
    "risk_flags",
    "sources",
  ];

  if (isPlainObject(response) && topLevelBlueprintKeys.some((key) => hasRenderableValue(response[key]))) {
    return response;
  }

  return {};
}

function formatLabel(key) {
  return String(key)
    .replace(/[_-]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

function makeTaskId(sectionKey, taskKey, index = 0) {
  return `${sectionKey}-${taskKey}-${index}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function extractLink(value) {
  if (typeof value === "string") {
    const match = value.match(/https?:\/\/\S+/i);
    return match ? match[0] : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const link = extractLink(item);
      if (link) return link;
    }
  }

  if (isPlainObject(value)) {
    const direct = value.externalLink || value.link || value.url || value.source;
    if (typeof direct === "string" && direct.trim()) return direct.trim();

    for (const nested of Object.values(value)) {
      const link = extractLink(nested);
      if (link) return link;
    }
  }

  return "";
}

function flattenText(value) {
  if (!hasRenderableValue(value)) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => flattenText(item)).filter(Boolean).join(" ");
  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([key, nested]) => `${formatLabel(key)}: ${flattenText(nested)}`.trim())
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function estimateTime(description) {
  const words = description.split(/\s+/).filter(Boolean).length;
  if (words < 12) return "15 minutes";
  if (words < 28) return "30 minutes";
  if (words < 55) return "45 minutes";
  return "60 minutes";
}

function determinePriority(title, description) {
  const haystack = `${title} ${description}`.toLowerCase();
  if (HIGH_PRIORITY_HINTS.some((hint) => haystack.includes(hint))) return "High";
  if (haystack.includes("optimize") || haystack.includes("improve") || haystack.includes("expand")) return "Low";
  return "Medium";
}

function determinePhase(sectionKey, taskKey) {
  const haystack = `${sectionKey} ${taskKey}`.toLowerCase();
  if (PHASE_HINTS.scale.some((hint) => haystack.includes(hint))) return "scale";
  if (PHASE_HINTS.growth.some((hint) => haystack.includes(hint))) return "growth";
  if (PHASE_HINTS.firstMoney.some((hint) => haystack.includes(hint))) return "firstMoney";
  return "foundation";
}

function createTask(sectionKey, taskKey, rawValue, index = 0) {
  const description = flattenText(rawValue) || "Review this step and define the exact deliverable for execution.";
  const title = `${formatLabel(sectionKey)}: ${formatLabel(taskKey)}`;

  return {
    id: makeTaskId(sectionKey, taskKey, index),
    title,
    description,
    priority: determinePriority(title, description),
    estimate: estimateTime(description),
    externalLink: extractLink(rawValue),
    phase: determinePhase(sectionKey, taskKey),
  };
}

function extractTasksFromSection(sectionKey, sectionValue) {
  if (!hasRenderableValue(sectionValue)) return [];

  if (Array.isArray(sectionValue)) {
    return sectionValue.filter(hasRenderableValue).map((item, index) => createTask(sectionKey, `task_${index + 1}`, item, index));
  }

  if (!isPlainObject(sectionValue)) {
    return [createTask(sectionKey, "task", sectionValue)];
  }

  const tasks = [];

  Object.entries(sectionValue).forEach(([taskKey, value]) => {
    if (!hasRenderableValue(value)) return;

    if (Array.isArray(value)) {
      value.filter(hasRenderableValue).forEach((item, index) => {
        tasks.push(createTask(sectionKey, `${taskKey}_${index + 1}`, item, index));
      });
      return;
    }

    tasks.push(createTask(sectionKey, taskKey, value));
  });

  return tasks;
}

function StarterBlueprintResult({ response, blueprint, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const source = response || blueprint || {};
  const normalized = normalizeBlueprint(source);
  const blueprintData = isPlainObject(normalized) ? normalized : {};

  const proposedBusinessName = (intakeValues?.proposedBusinessName || "").trim();
  const selectedBrandName = (intakeValues?.selectedBrandName || "").trim();
  const resolvedBusinessName = proposedBusinessName || selectedBrandName || "Your Company Name";
  const hasExplicitBusinessName = Boolean(proposedBusinessName || selectedBrandName);
  const generatedDate = new Date().toLocaleDateString();
  const businessIdea = (intakeValues?.businessIdea || "").trim();
  const selectedState = (intakeValues?.marketLocation || "").trim();

  const ventureSummary = blueprintData.ventureSummary || {};
  const starterPlan = blueprintData.starterPlan || {};
  const proPlan = blueprintData.proPlan || {};
  const elitePlan = blueprintData.elitePlan || {};
  const upgradeHooks = blueprintData.upgradeHooks || {};
  const strategistRecommendation = blueprintData.ai_strategist_recommendation || {};

  const actionPlan = {
    ...(hasRenderableValue(starterPlan.top3Actions) ? { top3Actions: starterPlan.top3Actions } : {}),
    ...(hasRenderableValue(starterPlan.first7Days) ? { first7Days: starterPlan.first7Days } : {}),
    ...(hasRenderableValue(starterPlan.thirtyDayActionPlan)
      ? { thirtyDayActionPlan: starterPlan.thirtyDayActionPlan }
      : {}),
  };
  const allTasks = useMemo(() => {
    return Object.entries(blueprintData).flatMap(([sectionKey, sectionValue]) => extractTasksFromSection(sectionKey, sectionValue));
  }, [blueprintData]);

  const storageKey = useMemo(() => {
    const blueprintSignature = JSON.stringify(Object.keys(blueprintData));
    return `pen2pro:task-progress:${resolvedBusinessName}:${blueprintSignature}`;
  }, [blueprintData, resolvedBusinessName]);

  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setCompletedTasks({});
        return;
      }
      const parsed = JSON.parse(saved);
      setCompletedTasks(isPlainObject(parsed) ? parsed : {});
    } catch {
      setCompletedTasks({});
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedTasks));
  }, [completedTasks, storageKey]);

  const completedCount = allTasks.filter((task) => completedTasks[task.id]).length;
  const progressPercent = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0;

  const tasksByPhase = PHASES.map((phase) => ({
    ...phase,
    tasks: allTasks.filter((task) => task.phase === phase.id),
  }));

  const nextRecommendedTask =
    allTasks.find((task) => !completedTasks[task.id] && task.priority === "High") ||
    allTasks.find((task) => !completedTasks[task.id]);

  const toggleTask = (taskId) => {
    setCompletedTasks((current) => ({
      ...current,
      [taskId]: !current[taskId],
    }));
  };

  const handlePrintBlueprint = () => {
    if (!hasExplicitBusinessName) {
      window.alert("Enter or select a business name so your blueprint prints correctly.");
      return;
    }

    window.print();
  };

  const handleEmailBlueprint = () => {
    if (!hasExplicitBusinessName) {
      window.alert("Enter or select a business name so your blueprint prints correctly.");
      return;
    }

    const subject = `Your PEN2PRO™ Business Execution Tasks for ${resolvedBusinessName}`;
    const lines = [
      `Here is your task-based execution system for ${resolvedBusinessName}, generated by PEN2PRO™.`,
      "",
      `Business idea: ${businessIdea || "Not provided"}`,
      `Date generated: ${generatedDate}`,
      `Progress: ${progressPercent}% complete`,
    ];

    if (selectedState) lines.push(`Selected state: ${selectedState}`);

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="starter-result">
      <div className="starter-result__header">
        <p className="starter-result__eyebrow">PEN2PRO STARTER EXECUTION SYSTEM</p>
        <h2 className="starter-result__title">Task System for: {resolvedBusinessName}</h2>
        <p className="starter-result__meta">Generated by PEN2PRO™</p>
        <p className="starter-result__meta">Date generated: {generatedDate}</p>
        <p className="starter-result__meta">Business idea: {businessIdea || "Not provided"}</p>
        {selectedState && <p className="starter-result__meta">Selected state: {selectedState}</p>}
        <p className="starter-result__subtitle">
          Complete tasks phase-by-phase to move from setup to revenue, growth, and scale.
        </p>
      </div>

      {hasRenderableValue(strategistRecommendation) && (
        <section className="starter-result__strategist-card">
          <p className="starter-result__eyebrow">{strategistRecommendation.label || "AI Strategist Recommendation"}</p>
          <h3>10M Business Strategist Engine</h3>
          <DetailList
            section={{
              ...(hasRenderableValue(strategistRecommendation.next_best_move)
                ? { nextBestMove: strategistRecommendation.next_best_move }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.fastest_path_to_first_1k)
                ? { fastestPathToFirst1k: strategistRecommendation.fastest_path_to_first_1k }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.what_to_avoid)
                ? { whatToAvoid: strategistRecommendation.what_to_avoid }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.execution_plan)
                ? { executionPlan: strategistRecommendation.execution_plan }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.strategist_insight)
                ? { strategistInsight: strategistRecommendation.strategist_insight }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.pro_breakdown)
                ? { proBreakdown: strategistRecommendation.pro_breakdown }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.advanced_insights_and_projections)
                ? { advancedInsightsAndProjections: strategistRecommendation.advanced_insights_and_projections }
                : {}),
            }}
            emptyMessage="Strategist recommendation is not available yet."
          />
        </section>
      )}

      <div className="starter-result__grid">
        {sections.map(([title, content]) => (
          <section key={title} className="starter-result__card">
            <h3>{title}</h3>
            {content}
      <div className="starter-result__tracker" role="status" aria-live="polite">
        <div className="starter-result__tracker-row">
          <p>
            <strong>Progress:</strong> {completedCount}/{allTasks.length} tasks complete ({progressPercent}%)
          </p>
          {nextRecommendedTask ? (
            <p>
              <strong>Next Recommended Action:</strong> {nextRecommendedTask.title}
            </p>
          ) : (
            <p>
              <strong>Next Recommended Action:</strong> All tasks complete. Great work.
            </p>
          )}
        </div>
        <div className="starter-result__progress" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="starter-result__phases">
        {tasksByPhase.map((phase) => (
          <section key={phase.id} className="starter-result__card">
            <h3>{phase.label}</h3>
            {phase.tasks.length === 0 ? (
              <p className="starter-result__empty">No tasks were generated for this phase yet.</p>
            ) : (
              <ul className="starter-result__task-list">
                {phase.tasks.map((task) => {
                  const isComplete = Boolean(completedTasks[task.id]);

                  return (
                    <li key={task.id} className={`starter-result__task ${isComplete ? "is-complete" : ""}`}>
                      <label className="starter-result__task-main">
                        <input
                          type="checkbox"
                          checked={isComplete}
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Mark ${task.title} as complete`}
                        />
                        <span className="starter-result__task-title">{isComplete ? "✔ " : ""}{task.title}</span>
                      </label>
                      <p className="starter-result__task-description">{task.description}</p>
                      <div className="starter-result__task-meta">
                        <span>Priority: {task.priority}</span>
                        <span>Estimated time: {task.estimate}</span>
                        {task.externalLink && (
                          <a href={task.externalLink} target="_blank" rel="noreferrer">
                            External link
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="starter-result__cta-block">
        <p className="starter-result__cta-copy">Ready for deeper strategy, automation, and execution tools?</p>
        <div className="starter-result__cta-actions">
          <button className="starter-button starter-button--secondary" onClick={handlePrintBlueprint}>
            Print / Save PDF
          </button>
          <button className="starter-button starter-button--secondary" onClick={handleEmailBlueprint}>
            Email Task Plan
          </button>
          <button className="starter-button starter-button--primary" onClick={onUpgradePro}>
            Upgrade to Pro
          </button>
          <button className="starter-button starter-button--secondary" onClick={onSeeElite}>
            See Elite
          </button>
          {typeof onStartAnother === "function" && (
            <button className="starter-button starter-button--secondary" onClick={onStartAnother}>
              Start Another Blueprint
            </button>
          )}
        </div>
      <div className="starter-result__cta-block">
  <p className="starter-result__cta-copy">
    Ready for deeper strategy, automation, and execution tools?
  </p>

  <div className="starter-result__cta-actions">
    <button
      type="button"
      className="starter-button starter-button--secondary"
      onClick={handlePrintBlueprint}
    >
      Print / Save PDF
    </button>

    <button
      type="button"
      className="starter-button starter-button--secondary"
      onClick={handleEmailBlueprint}
    >
      Email Task Plan
    </button>

    <button
      type="button"
      className="starter-button starter-button--primary"
      onClick={onUpgradePro}
    >
      Upgrade to Pro
    </button>

    <button
      type="button"
      className="starter-button starter-button--secondary"
      onClick={onSeeElite}
    >
      See Elite
    </button>

    {typeof onStartAnother === "function" && (
      <button
        type="button"
        className="starter-button starter-button--secondary"
        onClick={onStartAnother}
      >
        Start Another Blueprint
      </button>
    )}
  </div>
</div>
    </div>
  );
}

export default StarterBlueprintResult;
