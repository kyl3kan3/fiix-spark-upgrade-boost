import type { RiskFactor } from "./predictiveScoring";
export function parseRiskFactors(value: unknown): RiskFactor[] {
 if (!Array.isArray(value)) return [];
 return value.filter((v): v is RiskFactor => !!v && typeof v === "object" &&
   ["age", "failure_history", "open_work", "condition"].includes(v.key) &&
   typeof v.label === "string" && typeof v.detail === "string" &&
   Number.isFinite(v.score) && Number.isFinite(v.weight));
}
