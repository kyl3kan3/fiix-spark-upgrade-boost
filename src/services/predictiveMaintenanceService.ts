import { fetchCompanyPeople } from "@/services/companyDirectoryService";
import { parseRiskFactors } from "@/lib/riskFactorValidation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import {
  type RiskFactor,
  type RiskLevel,
} from "@/lib/predictiveScoring";

export interface RiskScoreAsset {
  id: string;
  name: string;
  status: string | null;
  location: string | null;
}

export interface AssetRiskScore {
  id: string;
  asset_id: string;
  company_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  failure_probability: number;
  predicted_failure_date: string | null;
  remaining_useful_life_days: number | null;
  contributing_factors: RiskFactor[];
  recommended_action: string | null;
  model_version: string;
  computed_at: string;
  asset: RiskScoreAsset | null;
}

export interface CreateFailureEventData {
  asset_id: string;
  failed_at?: string;
  resolved_at?: string | null;
  downtime_minutes?: number | null;
  severity?: "low" | "medium" | "high" | "critical";
  root_cause?: string;
  work_order_id?: string | null;
  notes?: string;
}

export interface CreateHealthMetricData {
  asset_id: string;
  metric_type: "runtime_hours" | "temperature" | "vibration" | "pressure" | "error_count" | "manual_condition";
  value: number;
  unit?: string;
  source?: "manual" | "daily_log" | "inspection" | "sensor";
  recorded_at?: string;
  notes?: string;
}

export interface RiskScoreRun {
  id: string;
  company_id: string;
  actor_id: string | null;
  triggered_by: "manual" | "scheduled";
  model_version: string;
  snapshot: Record<string, number>;
  summary: Record<string, number | string>;
  duration_ms: number | null;
  status: "success" | "failed" | "empty";
  error_message: string | null;
  created_at: string;
  actor_name?: string | null;
}

/** Fetch the most recent risk-score analysis runs for the current company. */
export const fetchRiskScoreRuns = async (limit = 10): Promise<RiskScoreRun[]> => {
  const { data: runs, error } = await supabase
    .from("asset_risk_score_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const actorIds = Array.from(new Set((runs ?? []).map((r) => r.actor_id).filter(Boolean))) as string[];
  let nameById = new Map<string, string>();
  if (actorIds.length > 0) {
    const profs = await fetchCompanyPeople();
    nameById = new Map(
      (profs ?? []).map((p) => [
        p.id,
        [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || "Team member",
      ]),
    );
  }
  return (runs ?? []).map((r) => ({
    id: r.id,
    company_id: r.company_id,
    actor_id: r.actor_id,
    triggered_by: r.triggered_by as "manual" | "scheduled",
    model_version: r.model_version,
    snapshot: (r.snapshot as Record<string, number>) ?? {},
    summary: (r.summary as Record<string, number | string>) ?? {},
    duration_ms: r.duration_ms,
    status: r.status as "success" | "failed" | "empty",
    error_message: r.error_message,
    created_at: r.created_at,
    actor_name: r.actor_id ? nameById.get(r.actor_id) ?? null : null,
  }));
};

/** Fetch the latest computed risk score per asset, joined with basic asset info. */
export const fetchAssetRiskScores = async (): Promise<AssetRiskScore[]> => {
  try {
    const [{ data: scores, error: scoresError }, { data: assets, error: assetsError }] =
      await Promise.all([
        supabase.from("asset_risk_scores").select("*").order("risk_score", { ascending: false }),
        supabase.from("assets").select("id, name, status, location"),
      ]);

    if (scoresError) throw scoresError;
    if (assetsError) throw assetsError;

    const assetById = new Map((assets ?? []).map((a) => [a.id, a]));

    return (scores ?? []).map((row) => ({
      id: row.id,
      asset_id: row.asset_id,
      company_id: row.company_id,
      risk_score: Number(row.risk_score),
      risk_level: row.risk_level as RiskLevel,
      failure_probability: Number(row.failure_probability),
      predicted_failure_date: row.predicted_failure_date,
      remaining_useful_life_days: row.remaining_useful_life_days,
      contributing_factors: parseRiskFactors(row.contributing_factors),
      recommended_action: row.recommended_action,
      model_version: row.model_version,
      computed_at: row.computed_at,
      asset: assetById.get(row.asset_id) ?? null,
    }));
  } catch (error) {
    console.error("Error fetching asset risk scores:", error);
    toast.error("Failed to load predictive maintenance data");
    throw error;
  }
};

/**
 * Recompute risk scores for every asset in the company from live operational
 * data (assets, work orders, failure events, condition metrics) using the
 * heuristic scoring engine, then upsert one row per asset.
 */
export const recomputeRiskScores = async (): Promise<AssetRiskScore[]> => {
  try {
    const { companyId } = await requireUserCompany();
    const { data, error } = await supabase.functions.invoke("recompute-risk-scores", {
      body: { company_id: companyId, triggered_by: "manual" },
    });
    if (error) throw error;
    const result = Array.isArray(data?.results)
      ? data.results.find((entry: { companyId: string }) => entry.companyId === companyId)
      : null;
    if (!data?.ok || !result || !["success", "empty"].includes(result.status)) {
      throw new Error(result?.error || data?.error || "Risk score recomputation failed");
    }
    const scores = await fetchAssetRiskScores();
    if (result.status === "empty") toast.info("No assets to score yet. Add equipment first.");
    else toast.success(`Risk scores recomputed for ${scores.length} assets`);
    return scores;
  } catch (error) {
    console.error("Error recomputing risk scores:", error);
    toast.error("Failed to recompute risk scores");
    throw error;
  }
};

export interface ScorableAsset {
  id: string;
  name: string;
}

/**
 * Lightweight asset list (id + name) for data-entry pickers. Company scoping is
 * enforced by row-level security on `assets` (same as the other reads in this
 * service), so no explicit company_id filter is applied here. Unbounded by
 * design — the picker shows the full (RLS-scoped) asset list; revisit with
 * search/virtualization if tenants accumulate very large asset counts.
 */
export const fetchScorableAssets = async (): Promise<ScorableAsset[]> => {
  const { data, error } = await supabase
    .from("assets")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }));
};

/** Record a ground-truth failure event (feeds future risk computations). */
export const createFailureEvent = async (payload: CreateFailureEventData): Promise<void> => {
  try {
    const { companyId } = await requireUserCompany();
    const { error } = await supabase.from("asset_failure_events").insert([{ ...payload, company_id: companyId }]);
    if (error) throw error;
    toast.success("Failure event recorded");
  } catch (error) {
    console.error("Error creating failure event:", error);
    toast.error("Failed to record failure event");
    throw error;
  }
};

/** Record a condition metric reading for an asset. */
export const createHealthMetric = async (payload: CreateHealthMetricData): Promise<void> => {
  try {
    const { companyId } = await requireUserCompany();
    const { error } = await supabase.from("asset_health_metrics").insert([{ ...payload, company_id: companyId }]);
    if (error) throw error;
    toast.success("Condition reading recorded");
  } catch (error) {
    console.error("Error creating health metric:", error);
    toast.error("Failed to record condition reading");
    throw error;
  }
};
