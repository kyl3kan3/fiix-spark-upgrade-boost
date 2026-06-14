/**
 * Predictive Maintenance scoring engine — "heuristic v1".
 *
 * This is a deterministic, fully explainable risk model (NOT a trained
 * black-box ML model). Given an asset's age, failure history, open work, and
 * recorded condition metrics it produces a 0-100 risk score, a failure
 * probability, an estimated remaining useful life, and a human-readable
 * breakdown of which factors drove the score.
 *
 * It is intentionally pure and dependency-free so it can be unit-tested in
 * isolation and reused anywhere (client service today, edge function later).
 */

export const MODEL_VERSION = "heuristic-v1";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface FailureEventInput {
  failed_at: string; // ISO timestamp
  downtime_minutes?: number | null;
  severity?: string | null;
}

export interface WorkOrderInput {
  status: string; // pending | in_progress | completed | cancelled
  priority: string; // low | medium | high | urgent
  due_date?: string | null;
}

export interface HealthMetricInput {
  metric_type: string; // runtime_hours | temperature | vibration | pressure | error_count | manual_condition
  value: number;
  recorded_at: string; // ISO timestamp
}

export interface AssetScoringInput {
  assetId: string;
  assetName?: string;
  status?: string | null; // active | inactive | maintenance | retired
  purchaseDate?: string | null; // ISO date
  /** Expected service life in years; defaults to 10. */
  expectedServiceLifeYears?: number;
  failureEvents: FailureEventInput[];
  workOrders: WorkOrderInput[];
  healthMetrics: HealthMetricInput[];
  /** Override "now" for deterministic testing. */
  now?: Date;
}

export interface RiskFactor {
  key: "age" | "failure_history" | "open_work" | "condition";
  label: string;
  /** 0-100 severity within this factor. */
  score: number;
  /** Fraction of the overall score this factor contributes (weights sum to 1). */
  weight: number;
  /** Human-readable explanation of the signal. */
  detail: string;
}

export interface RiskResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  failureProbability: number; // 0-1
  predictedFailureDate: string | null; // ISO
  remainingUsefulLifeDays: number | null;
  contributingFactors: RiskFactor[];
  recommendedAction: string;
  modelVersion: string;
}

export const FACTOR_WEIGHTS = {
  age: 0.25,
  failure_history: 0.3,
  open_work: 0.2,
  condition: 0.25,
} as const;

const DAY_MS = 1000 * 60 * 60 * 24;
const YEAR_DAYS = 365;
const DEFAULT_SERVICE_LIFE_YEARS = 10;

const clamp = (n: number, min = 0, max = 100): number => Math.min(max, Math.max(min, n));
const round1 = (n: number): number => Math.round(n * 10) / 10;
const daysBetween = (a: Date, b: Date): number => (a.getTime() - b.getTime()) / DAY_MS;

function isOpen(wo: WorkOrderInput): boolean {
  return wo.status === "pending" || wo.status === "in_progress";
}

/** Age factor — how far through its expected service life the asset is. */
function scoreAge(input: AssetScoringInput, now: Date): RiskFactor {
  const life = input.expectedServiceLifeYears ?? DEFAULT_SERVICE_LIFE_YEARS;
  if (!input.purchaseDate) {
    return {
      key: "age",
      label: "Age & wear",
      score: 40,
      weight: FACTOR_WEIGHTS.age,
      detail: "Purchase date unknown — assuming moderate age.",
    };
  }
  const ageYears = daysBetween(now, new Date(input.purchaseDate)) / YEAR_DAYS;
  const ratio = ageYears / life;
  const score = clamp(ratio * 100);
  return {
    key: "age",
    label: "Age & wear",
    score,
    weight: FACTOR_WEIGHTS.age,
    detail: `${ageYears.toFixed(1)} yrs old vs ${life} yr expected life (${Math.round(ratio * 100)}% of lifespan).`,
  };
}

/** Failure history factor — recent failures and recency. */
function scoreFailureHistory(input: AssetScoringInput, now: Date): RiskFactor {
  const events = [...input.failureEvents]
    .map((e) => new Date(e.failed_at))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (events.length === 0) {
    return {
      key: "failure_history",
      label: "Failure history",
      score: 0,
      weight: FACTOR_WEIGHTS.failure_history,
      detail: "No recorded failures.",
    };
  }

  const recentFailures = events.filter((d) => daysBetween(now, d) <= YEAR_DAYS).length;
  const last = events[events.length - 1];
  const daysSinceLast = daysBetween(now, last);
  const recencyBonus = daysSinceLast <= 30 ? 30 : daysSinceLast <= 90 ? 15 : 0;
  const score = clamp(recentFailures * 25 + recencyBonus);

  return {
    key: "failure_history",
    label: "Failure history",
    score,
    weight: FACTOR_WEIGHTS.failure_history,
    detail: `${recentFailures} failure(s) in last 12 months; last failure ${Math.round(daysSinceLast)} day(s) ago.`,
  };
}

/** Open / overdue / high-priority work factor. */
function scoreOpenWork(input: AssetScoringInput, now: Date): RiskFactor {
  const open = input.workOrders.filter(isOpen);
  const overdue = open.filter((wo) => wo.due_date && new Date(wo.due_date).getTime() < now.getTime()).length;
  const highPriority = open.filter((wo) => wo.priority === "high" || wo.priority === "urgent").length;
  const score = clamp(open.length * 15 + overdue * 25 + highPriority * 20);

  return {
    key: "open_work",
    label: "Open work orders",
    score,
    weight: FACTOR_WEIGHTS.open_work,
    detail: `${open.length} open (${overdue} overdue, ${highPriority} high priority).`,
  };
}

/** Normalize a single metric value to a 0-100 severity. */
function normalizeMetric(metricType: string, value: number): number | null {
  switch (metricType) {
    case "manual_condition":
      // Convention: 0 = perfect condition, 100 = failed.
      return clamp(value);
    case "error_count":
      return clamp(value * 10);
    case "vibration": // mm/s — ISO 10816 "rough" zone starts ~7-11 mm/s
      return clamp(value * 10);
    case "temperature": // °C — ramps above 60°C
      return clamp(value - 60);
    case "pressure":
    case "runtime_hours":
      return null; // no universal threshold without per-asset baselines
    default:
      return null;
  }
}

/** Condition factor — worst current signal plus any rising trend. */
function scoreCondition(input: AssetScoringInput): RiskFactor {
  const byType = new Map<string, HealthMetricInput[]>();
  for (const m of input.healthMetrics) {
    const list = byType.get(m.metric_type) ?? [];
    list.push(m);
    byType.set(m.metric_type, list);
  }

  const severities: number[] = [];
  let trendBonus = 0;
  let worstLabel = "";
  let worstSeverity = -1;

  for (const [type, metrics] of byType) {
    const sorted = [...metrics].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    );
    const latest = sorted[sorted.length - 1];
    const normalized = normalizeMetric(type, latest.value);
    if (normalized === null) continue;
    severities.push(normalized);
    if (normalized > worstSeverity) {
      worstSeverity = normalized;
      worstLabel = type;
    }
    // Rising trend: latest meaningfully higher than earliest reading.
    if (sorted.length >= 2) {
      const first = sorted[0].value;
      if (first > 0 && latest.value > first * 1.2) trendBonus = 15;
    }
  }

  if (severities.length === 0) {
    return {
      key: "condition",
      label: "Condition signals",
      score: 30,
      weight: FACTOR_WEIGHTS.condition,
      detail: "No condition data recorded.",
    };
  }

  const score = clamp(Math.max(...severities) + trendBonus);
  const trendText = trendBonus > 0 ? ", rising trend detected" : "";
  return {
    key: "condition",
    label: "Condition signals",
    score,
    weight: FACTOR_WEIGHTS.condition,
    detail: `Worst signal: ${worstLabel.replace(/_/g, " ")}${trendText}.`,
  };
}

function toRiskLevel(score: number): RiskLevel {
  if (score < 30) return "low";
  if (score < 55) return "medium";
  if (score < 80) return "high";
  return "critical";
}

/** Mean time between failures, in days, when at least two failures exist. */
function meanTimeBetweenFailures(events: FailureEventInput[]): number | null {
  const dates = events
    .map((e) => new Date(e.failed_at))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length < 2) return null;
  let total = 0;
  for (let i = 1; i < dates.length; i++) total += daysBetween(dates[i], dates[i - 1]);
  return total / (dates.length - 1);
}

function estimateRemainingLife(
  input: AssetScoringInput,
  riskScore: number,
  now: Date,
): number | null {
  const mtbf = meanTimeBetweenFailures(input.failureEvents);
  let horizon: number | null = null;

  if (mtbf) {
    horizon = mtbf;
  } else if (input.purchaseDate) {
    const life = input.expectedServiceLifeYears ?? DEFAULT_SERVICE_LIFE_YEARS;
    const ageYears = daysBetween(now, new Date(input.purchaseDate)) / YEAR_DAYS;
    horizon = Math.max(0, (life - ageYears) * YEAR_DAYS);
  }

  if (horizon === null) return null;
  // Higher risk shortens the runway.
  return Math.max(0, Math.round(horizon * (1 - riskScore / 100)));
}

function buildRecommendation(level: RiskLevel, dominant: RiskFactor): string {
  const driver = `Top driver: ${dominant.label.toLowerCase()}.`;
  switch (level) {
    case "critical":
      return `Immediate inspection required — schedule emergency maintenance now. ${driver}`;
    case "high":
      return `Schedule preventive maintenance within 2 weeks. ${driver}`;
    case "medium":
      return `Plan preventive maintenance this quarter and keep monitoring. ${driver}`;
    default:
      return `No action needed — continue routine monitoring. ${driver}`;
  }
}

/**
 * Compute the predictive-maintenance risk for a single asset.
 */
export function computeAssetRisk(input: AssetScoringInput): RiskResult {
  const now = input.now ?? new Date();

  const factors: RiskFactor[] = [
    scoreAge(input, now),
    scoreFailureHistory(input, now),
    scoreOpenWork(input, now),
    scoreCondition(input),
  ];

  const riskScore = round1(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  const riskLevel = toRiskLevel(riskScore);
  const failureProbability = Math.round((riskScore / 100) * 100) / 100;

  const remainingUsefulLifeDays = estimateRemainingLife(input, riskScore, now);
  const predictedFailureDate =
    remainingUsefulLifeDays === null
      ? null
      : new Date(now.getTime() + remainingUsefulLifeDays * DAY_MS).toISOString();

  const dominant = [...factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];

  return {
    riskScore,
    riskLevel,
    failureProbability,
    predictedFailureDate,
    remainingUsefulLifeDays,
    contributingFactors: factors,
    recommendedAction: buildRecommendation(riskLevel, dominant),
    modelVersion: MODEL_VERSION,
  };
}
