import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { computeAssetRisk, MODEL_VERSION } from "./scoring.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Counts = { critical: number; high: number; medium: number; low: number };

async function scoreCompany(
  admin: ReturnType<typeof createClient>,
  companyId: string,
  triggeredBy: "manual" | "scheduled",
  actorId: string | null,
) {
  const startedAt = Date.now();
  const [assetsRes, woRes, failuresRes, metricsRes] = await Promise.all([
    admin.from("assets").select("id, name, status, purchase_date").eq("company_id", companyId),
    admin.from("work_orders").select("asset_id, status, priority, due_date").eq("company_id", companyId),
    admin.from("asset_failure_events").select("asset_id, failed_at, downtime_minutes, severity").eq("company_id", companyId),
    admin.from("asset_health_metrics").select("asset_id, metric_type, value, recorded_at").eq("company_id", companyId),
  ]);

  const snapshot = {
    assets: assetsRes.data?.length ?? 0,
    work_orders: woRes.data?.length ?? 0,
    failure_events: failuresRes.data?.length ?? 0,
    health_metrics: metricsRes.data?.length ?? 0,
  };

  const baseRun = {
    company_id: companyId,
    actor_id: actorId,
    triggered_by: triggeredBy,
    model_version: MODEL_VERSION,
    snapshot,
  };

  const assets = assetsRes.data ?? [];
  if (assets.length === 0) {
    await admin.from("asset_risk_score_runs").insert({
      ...baseRun,
      summary: { total: 0 },
      duration_ms: Date.now() - startedAt,
      status: "empty",
    });
    return { companyId, scored: 0, status: "empty" as const };
  }

  const now = new Date();
  const counts: Counts = { critical: 0, high: 0, medium: 0, low: 0 };
  let scoreSum = 0;

  const rows = assets.map((a: { id: string; name: string; status: string | null; purchase_date: string | null }) => {
    const result = computeAssetRisk({
      assetId: a.id,
      assetName: a.name,
      status: a.status,
      purchaseDate: a.purchase_date,
      failureEvents: (failuresRes.data ?? [])
        .filter((f) => f.asset_id === a.id)
        .map((f) => ({ failed_at: f.failed_at, downtime_minutes: f.downtime_minutes, severity: f.severity })),
      workOrders: (woRes.data ?? [])
        .filter((w) => w.asset_id === a.id)
        .map((w) => ({ status: w.status, priority: w.priority, due_date: w.due_date })),
      healthMetrics: (metricsRes.data ?? [])
        .filter((m) => m.asset_id === a.id)
        .map((m) => ({ metric_type: m.metric_type, value: Number(m.value), recorded_at: m.recorded_at })),
      now,
    });
    counts[result.riskLevel] += 1;
    scoreSum += result.riskScore;
    return {
      company_id: companyId,
      asset_id: a.id,
      risk_score: result.riskScore,
      risk_level: result.riskLevel,
      failure_probability: result.failureProbability,
      predicted_failure_date: result.predictedFailureDate,
      remaining_useful_life_days: result.remainingUsefulLifeDays,
      contributing_factors: result.contributingFactors,
      recommended_action: result.recommendedAction,
      model_version: result.modelVersion,
      computed_at: now.toISOString(),
    };
  });

  const { error: upsertError } = await admin
    .from("asset_risk_scores")
    .upsert(rows, { onConflict: "asset_id" });

  const duration = Date.now() - startedAt;
  if (upsertError) {
    await admin.from("asset_risk_score_runs").insert({
      ...baseRun,
      summary: { total: assets.length, attempted: rows.length },
      duration_ms: duration,
      status: "failed",
      error_message: upsertError.message,
    });
    throw upsertError;
  }

  await admin.from("asset_risk_score_runs").insert({
    ...baseRun,
    summary: {
      total: assets.length,
      ...counts,
      avg_score: Math.round((scoreSum / assets.length) * 10) / 10,
    },
    duration_ms: duration,
    status: "success",
  });

  return { companyId, scored: assets.length, status: "success" as const, counts };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const triggeredBy: "manual" | "scheduled" = body?.triggered_by === "manual" ? "manual" : "scheduled";
    const actorId: string | null = body?.actor_id ?? null;
    const onlyCompanyId: string | null = body?.company_id ?? null;

    let companies: { id: string }[];
    if (onlyCompanyId) {
      companies = [{ id: onlyCompanyId }];
    } else {
      const { data, error } = await admin.from("companies").select("id");
      if (error) throw error;
      companies = data ?? [];
    }

    const results = [];
    for (const c of companies) {
      try {
        results.push(await scoreCompany(admin, c.id, triggeredBy, actorId));
      } catch (e) {
        results.push({ companyId: c.id, status: "error" as const, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});