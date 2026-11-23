import { computeAssetRisk, type AssetScoringInput, type RiskResult } from "@/lib/predictiveScoring";

/** Fixed clock so homepage sample scores stay reproducible in tests and UI. */
export const HOME_RISK_SAMPLE_NOW = new Date("2026-06-14T00:00:00.000Z");

const isoDaysBefore = (days: number) =>
  new Date(HOME_RISK_SAMPLE_NOW.getTime() - days * 86_400_000).toISOString();

/** Inputs behind the homepage sample workflow — run through computeAssetRisk as-is. */
export const HOME_RISK_SAMPLE_INPUT: AssetScoringInput = {
  assetId: "sample-compressor-2",
  assetName: "Compressor #2",
  purchaseDate: "2016-03-01T00:00:00.000Z",
  expectedServiceLifeYears: 12,
  failureEvents: [
    { failed_at: isoDaysBefore(82) },
    { failed_at: isoDaysBefore(47) },
    { failed_at: isoDaysBefore(18) },
  ],
  workOrders: [
    { status: "pending", priority: "urgent", due_date: isoDaysBefore(6) },
    { status: "in_progress", priority: "high", due_date: isoDaysBefore(1) },
  ],
  healthMetrics: [
    { metric_type: "vibration", value: 4.1, recorded_at: isoDaysBefore(55) },
    { metric_type: "vibration", value: 9.2, recorded_at: isoDaysBefore(3) },
  ],
  now: HOME_RISK_SAMPLE_NOW,
};

export const HOME_RISK_SAMPLE_WORK_ORDER =
  "WO-1042 (sample): Compressor #2 — risk-driven maintenance from score";

export function getHomeRiskSampleResult(): RiskResult {
  return computeAssetRisk(HOME_RISK_SAMPLE_INPUT);
}

function dominantFactorLabel(result: RiskResult): string {
  const dominant = [...result.contributingFactors].sort(
    (a, b) => b.score * b.weight - a.score * a.weight,
  )[0];
  return dominant.label;
}

function formatIsoDate(iso: string): string {
  return iso.slice(0, 10);
}

export type HomeRiskSampleWorkflowRow = { step: string; detail: string };

export function buildHomeRiskSampleWorkflow(): HomeRiskSampleWorkflowRow[] {
  const result = getHomeRiskSampleResult();
  const topDriver = dominantFactorLabel(result).toLowerCase();
  const purchaseYear = HOME_RISK_SAMPLE_INPUT.purchaseDate!.slice(0, 4);
  const life = HOME_RISK_SAMPLE_INPUT.expectedServiceLifeYears ?? 10;
  const failureDates = HOME_RISK_SAMPLE_INPUT.failureEvents.map((e) => formatIsoDate(e.failed_at)).join(", ");
  const vibration = HOME_RISK_SAMPLE_INPUT.healthMetrics
    .filter((m) => m.metric_type === "vibration")
  const latestVibration = [...vibration].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  )[0];

  const open = HOME_RISK_SAMPLE_INPUT.workOrders.filter(
    (wo) => wo.status === "pending" || wo.status === "in_progress",
  );
  const overdue = open.filter(
    (wo) => wo.due_date && new Date(wo.due_date).getTime() < HOME_RISK_SAMPLE_NOW.getTime(),
  ).length;

  return [
    {
      step: "Sample asset",
      detail: `Compressor #2 — purchased ${purchaseYear}-03-01, expected service life ${life} years`,
    },
    {
      step: "Recorded context",
      detail: `Failures on ${failureDates}; ${open.length} open work orders (${overdue} overdue, urgent/high priority); vibration ${latestVibration.value} mm/s on ${formatIsoDate(latestVibration.recorded_at)}`,
    },
    {
      step: "Failure-risk score",
      detail: `${result.riskScore} — level ${result.riskLevel} — top driver: ${topDriver}`,
    },
    {
      step: "Recommended action",
      detail: result.recommendedAction,
    },
    {
      step: "Work order",
      detail: HOME_RISK_SAMPLE_WORK_ORDER,
    },
  ];
}