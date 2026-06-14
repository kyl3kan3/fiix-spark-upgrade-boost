import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import {
  computeAssetRisk,
  type AssetScoringInput,
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
      contributing_factors: (row.contributing_factors as unknown as RiskFactor[]) ?? [],
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

    const [assetsRes, workOrdersRes, failuresRes, metricsRes] = await Promise.all([
      supabase.from("assets").select("id, name, status, purchase_date"),
      supabase.from("work_orders").select("asset_id, status, priority, due_date"),
      supabase.from("asset_failure_events").select("asset_id, failed_at, downtime_minutes, severity"),
      supabase.from("asset_health_metrics").select("asset_id, metric_type, value, recorded_at"),
    ]);

    if (assetsRes.error) throw assetsRes.error;
    if (workOrdersRes.error) throw workOrdersRes.error;
    if (failuresRes.error) throw failuresRes.error;
    if (metricsRes.error) throw metricsRes.error;

    const assets = assetsRes.data ?? [];
    if (assets.length === 0) {
      toast.info("No assets to score yet. Add equipment first.");
      return [];
    }

    const now = new Date();
    const rows = assets.map((asset) => {
      const input: AssetScoringInput = {
        assetId: asset.id,
        assetName: asset.name,
        status: asset.status,
        purchaseDate: asset.purchase_date,
        failureEvents: (failuresRes.data ?? [])
          .filter((f) => f.asset_id === asset.id)
          .map((f) => ({
            failed_at: f.failed_at,
            downtime_minutes: f.downtime_minutes,
            severity: f.severity,
          })),
        workOrders: (workOrdersRes.data ?? [])
          .filter((w) => w.asset_id === asset.id)
          .map((w) => ({ status: w.status, priority: w.priority, due_date: w.due_date })),
        healthMetrics: (metricsRes.data ?? [])
          .filter((m) => m.asset_id === asset.id)
          .map((m) => ({
            metric_type: m.metric_type,
            value: Number(m.value),
            recorded_at: m.recorded_at,
          })),
        now,
      };

      const result = computeAssetRisk(input);
      return {
        company_id: companyId,
        asset_id: asset.id,
        risk_score: result.riskScore,
        risk_level: result.riskLevel,
        failure_probability: result.failureProbability,
        predicted_failure_date: result.predictedFailureDate,
        remaining_useful_life_days: result.remainingUsefulLifeDays,
        contributing_factors: result.contributingFactors as unknown as Json,
        recommended_action: result.recommendedAction,
        model_version: result.modelVersion,
        computed_at: now.toISOString(),
      };
    });

    const { error: upsertError } = await supabase
      .from("asset_risk_scores")
      .upsert(rows, { onConflict: "asset_id" });

    if (upsertError) throw upsertError;

    toast.success(`Risk scores recomputed for ${rows.length} asset${rows.length === 1 ? "" : "s"}`);
    return fetchAssetRiskScores();
  } catch (error) {
    console.error("Error recomputing risk scores:", error);
    toast.error("Failed to recompute risk scores");
    throw error;
  }
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
