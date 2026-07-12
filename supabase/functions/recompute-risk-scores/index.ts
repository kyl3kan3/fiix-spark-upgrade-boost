import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { computeAssetRisk, MODEL_VERSION } from "./scoring.ts";
import type { Database, Json } from "../../../src/integrations/supabase/types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");

type Counts = { critical: number; high: number; medium: number; low: number };

async function scoreCompany(
  admin: SupabaseClient<Database>,
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
      contributing_factors: result.contributingFactors as unknown as Json,
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
    // --- Authentication ---
    // Accept either:
    //   1. A valid shared-secret header (used by scheduled jobs / self-heal)
    //   2. A valid user JWT belonging to an administrator/super_admin
    const providedSecret = req.headers.get("x-notify-secret");
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    let authMode: "secret" | "user" | null = null;
    let verifiedUserId: string | null = null;
    let verifiedUserCompanyId: string | null = null;
    let verifiedIsSuperAdmin = false;

    if (NOTIFY_SHARED_SECRET && providedSecret && providedSecret === NOTIFY_SHARED_SECRET) {
      authMode = "secret";
    } else if (bearer && bearer !== SUPABASE_ANON_KEY) {
      // Verify the JWT
      const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: userData, error: userError } = await userClient.auth.getUser(bearer);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      verifiedUserId = userData.user.id;

      // Look up company + role (using service role to avoid RLS recursion)
      const adminLookup = createClient<Database>(SUPABASE_URL, SERVICE_ROLE);
      const { data: profile } = await adminLookup
        .from("profiles")
        .select("company_id")
        .eq("id", verifiedUserId)
        .maybeSingle();
      verifiedUserCompanyId = (profile as { company_id?: string } | null)?.company_id ?? null;

      const { data: roles } = await adminLookup
        .from("user_roles")
        .select("role")
        .eq("user_id", verifiedUserId);
      const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
      verifiedIsSuperAdmin = roleSet.has("super_admin");
      const isAdmin = verifiedIsSuperAdmin || roleSet.has("administrator");
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      authMode = "user";
    } else {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const triggeredBy: "manual" | "scheduled" = body?.triggered_by === "manual" ? "manual" : "scheduled";
    // Never trust client-supplied actor_id. Use the verified user id when present.
    const actorId: string | null = verifiedUserId;
    let onlyCompanyId: string | null = body?.company_id ?? null;

    // For user-authenticated calls, force company scope to the caller's company
    // unless they are a super_admin (who may run cross-company recomputes).
    if (authMode === "user" && !verifiedIsSuperAdmin) {
      if (!verifiedUserCompanyId) {
        return new Response(JSON.stringify({ error: "No company context" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      onlyCompanyId = verifiedUserCompanyId;
    }

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
