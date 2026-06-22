/**
 * Pure "guided setup" engine: maps a company's onboarding answers to a tailored
 * plan (ranked module recommendations + a setup checklist). No data-layer / React
 * imports, so it's fully unit-testable.
 */

export type GoalKey =
  | "reduce_downtime"
  | "control_costs"
  | "track_energy"
  | "go_preventive"
  | "organize_assets"
  | "get_insights";

export interface GoalOption {
  key: GoalKey;
  label: string;
  description: string;
}

export const GOALS: GoalOption[] = [
  { key: "reduce_downtime", label: "Reduce downtime", description: "Predict and prevent equipment failures." },
  { key: "control_costs", label: "Control costs", description: "Track maintenance spend and savings." },
  { key: "track_energy", label: "Track energy use", description: "Monitor power consumption and cost." },
  { key: "go_preventive", label: "Go preventive", description: "Shift from reactive to scheduled upkeep." },
  { key: "organize_assets", label: "Organize assets", description: "Centralize equipment and documents." },
  { key: "get_insights", label: "Get insights", description: "Ask questions and see analytics." },
];

export const TEAM_SIZES = ["1-5", "6-20", "21-100", "100+"] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export interface OnboardingAnswers {
  goals: GoalKey[];
  industry?: string | null;
  teamSize?: string | null;
}

export interface RecommendedModule {
  id: string;
  title: string;
  reason: string;
  href: string;
  icon: string; // lucide icon name, resolved in the UI
}

export interface PlanTask {
  id: string;
  label: string;
  href: string;
}

export interface OnboardingPlan {
  modules: RecommendedModule[];
  tasks: PlanTask[];
  headline: string;
}

interface ModuleDef extends RecommendedModule {
  goals: GoalKey[];
  baseWeight: number; // tiebreaker / baseline relevance
}

const MODULES: ModuleDef[] = [
  {
    id: "predictive",
    title: "Predictive Maintenance",
    href: "/predictive-maintenance",
    icon: "BrainCircuit",
    reason: "Surface which equipment is most likely to fail so you can act first.",
    goals: ["reduce_downtime", "go_preventive"],
    baseWeight: 3,
  },
  {
    id: "costs",
    title: "Cost & Savings",
    href: "/cost-tracking",
    icon: "Wallet",
    reason: "Track maintenance spend and see preventive-vs-reactive savings.",
    goals: ["control_costs"],
    baseWeight: 2,
  },
  {
    id: "power",
    title: "Power Usage",
    href: "/power-usage",
    icon: "Gauge",
    reason: "Monitor energy consumption and cost across your equipment.",
    goals: ["track_energy", "control_costs"],
    baseWeight: 1,
  },
  {
    id: "assets",
    title: "Equipment",
    href: "/assets",
    icon: "Package",
    reason: "Build your asset register — the foundation everything else builds on.",
    goals: ["organize_assets", "go_preventive", "reduce_downtime"],
    baseWeight: 2,
  },
  {
    id: "documents",
    title: "Onboarding Documents",
    href: "/onboarding/documents",
    icon: "FileStack",
    reason: "Drop in existing asset lists and manuals to get a head start.",
    goals: ["organize_assets"],
    baseWeight: 1,
  },
  {
    id: "assistant",
    title: "Assistant",
    href: "/assistant",
    icon: "Bot",
    reason: "Ask questions about your data and draft work orders by chat.",
    goals: ["get_insights"],
    baseWeight: 1,
  },
  {
    id: "schedules",
    title: "Maintenance Schedules",
    href: "/maintenance",
    icon: "CalendarClock",
    reason: "Set up recurring preventive maintenance so nothing slips.",
    goals: ["go_preventive"],
    baseWeight: 1,
  },
];

const GOAL_TASKS: Partial<Record<GoalKey, PlanTask[]>> = {
  reduce_downtime: [{ id: "log-failure", label: "Log a past failure to seed risk scoring", href: "/predictive-maintenance" }],
  control_costs: [{ id: "log-cost", label: "Record your first maintenance cost", href: "/cost-tracking" }],
  track_energy: [{ id: "log-energy", label: "Add an energy reading or import a CSV", href: "/power-usage" }],
  go_preventive: [{ id: "add-schedule", label: "Create a preventive maintenance schedule", href: "/maintenance" }],
  organize_assets: [{ id: "upload-docs", label: "Upload your existing asset documents", href: "/onboarding/documents" }],
  get_insights: [{ id: "ask-assistant", label: "Ask the assistant about your equipment", href: "/assistant" }],
};

/** Deterministically rank modules by how strongly they serve the selected goals. */
export function buildOnboardingPlan(answers: OnboardingAnswers): OnboardingPlan {
  const goals = answers.goals ?? [];
  const goalSet = new Set(goals);

  const scored = MODULES.map((m) => {
    const matches = m.goals.filter((g) => goalSet.has(g)).length;
    return { module: m, score: matches * 10 + m.baseWeight, matches };
  });

  // If no goals were chosen, fall back to the highest baseline modules.
  const relevant = scored.filter((s) => (goals.length === 0 ? true : s.matches > 0));
  relevant.sort((a, b) => b.score - a.score);

  const modules: RecommendedModule[] = relevant.slice(0, 5).map(({ module }) => ({
    id: module.id,
    title: module.title,
    reason: module.reason,
    href: module.href,
    icon: module.icon,
  }));

  const tasks: PlanTask[] = [
    { id: "add-asset", label: "Add your first piece of equipment", href: "/assets" },
    { id: "invite-team", label: "Invite your team", href: "/team" },
  ];
  const seen = new Set(tasks.map((t) => t.id));
  for (const g of goals) {
    for (const t of GOAL_TASKS[g] ?? []) {
      if (!seen.has(t.id)) {
        tasks.push(t);
        seen.add(t.id);
      }
    }
  }

  const headline =
    goals.length === 0
      ? "A solid starting point for your maintenance program"
      : `Your plan for ${goals.length === 1 ? "one focus" : `${goals.length} focuses`}: ${goals
          .map((g) => GOALS.find((x) => x.key === g)?.label ?? g)
          .join(", ")}`;

  return { modules, tasks, headline };
}
