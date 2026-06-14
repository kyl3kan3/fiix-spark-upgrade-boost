import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Healer = "risk_scoring" | "work_orders" | "data_integrity" | "ai_triage";

interface RunResult {
  scanned: number;
  fixed: number;
  flagged: number;
  actions: Array<{
    entity_type: string;
    entity_id: string | null;
    action: string;
    before?: unknown;
    after?: unknown;
    details?: string;
    requires_review?: boolean;
  }>;
  snapshot?: Record<string, unknown>;
  error?: string;
}

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function admin() {
  return createClient(PROJECT_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ------- HEALERS -------

async function healRiskScoring(companyId: string): Promise<RunResult> {
  const sb = admin();
  const out: RunResult = { scanned: 0, fixed: 0, flagged: 0, actions: [] };

  // Find recent failed/empty runs in last 24h
  const since = new Date(Date.now() - 86400000).toISOString();
  const { data: bad } = await sb
    .from("asset_risk_score_runs")
    .select("id, status, error_message, created_at")
    .eq("company_id", companyId)
    .in("status", ["failed", "empty"])
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);

  out.scanned = bad?.length ?? 0;
  if (!bad || bad.length === 0) return out;

  // Retry by calling recompute-risk-scores with exponential backoff
  let lastError: string | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(`${PROJECT_URL}/functions/v1/recompute-risk-scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE}`,
          apikey: SERVICE_ROLE,
          "x-notify-secret": Deno.env.get("NOTIFY_SHARED_SECRET") ?? "",
        },
        body: JSON.stringify({ company_id: companyId, triggered_by: "self_heal" }),
      });
      if (resp.ok) {
        out.fixed = 1;
        out.actions.push({
          entity_type: "risk_scoring",
          entity_id: null,
          action: "retry",
          details: `Recovered after ${attempt + 1} attempt(s)`,
        });
        return out;
      }
      lastError = `HTTP ${resp.status}: ${await resp.text()}`;
    } catch (e) {
      lastError = (e as Error).message;
    }
    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
  }

  out.flagged = 1;
  out.actions.push({
    entity_type: "risk_scoring",
    entity_id: null,
    action: "flag",
    details: `Retries exhausted: ${lastError ?? "unknown"}`,
    requires_review: true,
  });
  return out;
}

async function healWorkOrders(companyId: string): Promise<RunResult> {
  const sb = admin();
  const out: RunResult = { scanned: 0, fixed: 0, flagged: 0, actions: [] };

  // Get company members
  const { data: members } = await sb
    .from("profiles")
    .select("id, role")
    .eq("company_id", companyId);
  const memberIds = new Set((members ?? []).map((m) => m.id));
  const admin_ = (members ?? []).find((m) => m.role === "administrator");

  // Stalled (in_progress > 14 days, no recent update)
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: stalled } = await sb
    .from("work_orders")
    .select("id, title, status, assigned_to, updated_at, company_id")
    .eq("company_id", companyId)
    .eq("status", "in_progress")
    .lt("updated_at", cutoff);

  out.scanned += stalled?.length ?? 0;
  for (const wo of stalled ?? []) {
    out.flagged += 1;
    out.actions.push({
      entity_type: "work_order",
      entity_id: wo.id,
      action: "flag",
      details: `"${wo.title}" has been in progress with no update for >14 days`,
      requires_review: true,
    });
  }

  // Orphaned assignee (assigned_to not in members)
  const { data: assigned } = await sb
    .from("work_orders")
    .select("id, title, assigned_to, status, company_id")
    .eq("company_id", companyId)
    .not("assigned_to", "is", null)
    .neq("status", "completed");

  for (const wo of assigned ?? []) {
    if (wo.assigned_to && !memberIds.has(wo.assigned_to)) {
      out.scanned += 1;
      const newAssignee = admin_?.id ?? null;
      const { error } = await sb
        .from("work_orders")
        .update({ assigned_to: newAssignee })
        .eq("id", wo.id);
      if (!error) {
        out.fixed += 1;
        out.actions.push({
          entity_type: "work_order",
          entity_id: wo.id,
          action: "reassign",
          before: { assigned_to: wo.assigned_to },
          after: { assigned_to: newAssignee },
          details: `Reassigned "${wo.title}" — previous assignee no longer in company`,
        });
      }
    }
  }

  return out;
}

async function healDataIntegrity(companyId: string): Promise<RunResult> {
  const sb = admin();
  const out: RunResult = { scanned: 0, fixed: 0, flagged: 0, actions: [] };

  // 1. Orphan risk scores (asset deleted)
  const { data: assets } = await sb.from("assets").select("id").eq("company_id", companyId);
  const assetIds = new Set((assets ?? []).map((a) => a.id));
  const { data: scores } = await sb
    .from("asset_risk_scores")
    .select("id, asset_id")
    .eq("company_id", companyId);
  const orphanScores = (scores ?? []).filter((s) => !assetIds.has(s.asset_id));
  out.scanned += orphanScores.length;
  for (const s of orphanScores) {
    const { error } = await sb.from("asset_risk_scores").delete().eq("id", s.id);
    if (!error) {
      out.fixed += 1;
      out.actions.push({
        entity_type: "asset_risk_score",
        entity_id: s.id,
        action: "delete",
        before: { asset_id: s.asset_id },
        details: "Removed risk score for deleted asset",
      });
    }
  }

  // 2. Profiles missing user_roles entries
  const { data: profilesNoRole } = await sb
    .from("profiles")
    .select("id, role")
    .eq("company_id", companyId);
  const profIds = (profilesNoRole ?? []).map((p) => p.id);
  if (profIds.length > 0) {
    const { data: rolesRows } = await sb
      .from("user_roles")
      .select("user_id")
      .in("user_id", profIds);
    const haveRole = new Set((rolesRows ?? []).map((r) => r.user_id));
    for (const p of profilesNoRole ?? []) {
      if (!haveRole.has(p.id) && p.role) {
        out.scanned += 1;
        const roleVal = ["administrator", "technician", "manager", "viewer"].includes(p.role)
          ? p.role
          : "technician";
        const { error } = await sb.from("user_roles").insert({
          user_id: p.id,
          role: roleVal,
          company_id: companyId,
        });
        if (!error) {
          out.fixed += 1;
          out.actions.push({
            entity_type: "user_role",
            entity_id: p.id,
            action: "fix",
            after: { role: roleVal, company_id: companyId },
            details: `Created missing role entry (${roleVal})`,
          });
        }
      }
    }
  }

  // 3. Work orders missing company_id — backfill from creator
  const { data: woMissing } = await sb
    .from("work_orders")
    .select("id, created_by, title")
    .is("company_id", null)
    .limit(50);
  for (const wo of woMissing ?? []) {
    if (!wo.created_by) continue;
    const { data: creator } = await sb
      .from("profiles")
      .select("company_id")
      .eq("id", wo.created_by)
      .maybeSingle();
    if (creator?.company_id === companyId) {
      out.scanned += 1;
      const { error } = await sb
        .from("work_orders")
        .update({ company_id: companyId })
        .eq("id", wo.id);
      if (!error) {
        out.fixed += 1;
        out.actions.push({
          entity_type: "work_order",
          entity_id: wo.id,
          action: "fix",
          after: { company_id: companyId },
          details: `Backfilled company on "${wo.title}"`,
        });
      }
    }
  }

  return out;
}

async function healAiTriage(companyId: string): Promise<RunResult> {
  const sb = admin();
  const out: RunResult = { scanned: 0, fixed: 0, flagged: 0, actions: [] };

  // Find recent public requests without a triage row
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: requests } = await sb
    .from("public_requests")
    .select("id")
    .eq("company_id", companyId)
    .gte("created_at", since)
    .limit(50);
  if (!requests || requests.length === 0) return out;

  const ids = requests.map((r) => r.id);
  const { data: existing } = await sb
    .from("public_request_triage")
    .select("request_id")
    .in("request_id", ids);
  const have = new Set((existing ?? []).map((t) => t.request_id));
  const missing = ids.filter((id) => !have.has(id));
  out.scanned = missing.length;

  for (const reqId of missing.slice(0, 10)) {
    try {
      const resp = await fetch(`${PROJECT_URL}/functions/v1/triage-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE}`,
          apikey: SERVICE_ROLE,
        },
        body: JSON.stringify({ request_id: reqId, internal: true }),
      });
      if (resp.ok) {
        out.fixed += 1;
        out.actions.push({
          entity_type: "public_request",
          entity_id: reqId,
          action: "fix",
          details: "Generated missing AI triage suggestion",
        });
      } else {
        out.flagged += 1;
        out.actions.push({
          entity_type: "public_request",
          entity_id: reqId,
          action: "flag",
          details: `Triage failed: HTTP ${resp.status}`,
          requires_review: true,
        });
      }
    } catch (e) {
      out.flagged += 1;
      out.actions.push({
        entity_type: "public_request",
        entity_id: reqId,
        action: "flag",
        details: `Triage error: ${(e as Error).message}`,
        requires_review: true,
      });
    }
  }

  return out;
}

const HEALERS: Record<Healer, (companyId: string) => Promise<RunResult>> = {
  risk_scoring: healRiskScoring,
  work_orders: healWorkOrders,
  data_integrity: healDataIntegrity,
  ai_triage: healAiTriage,
};

const SETTING_COLUMN: Record<Healer, string> = {
  risk_scoring: "risk_scoring_enabled",
  work_orders: "work_orders_enabled",
  data_integrity: "data_integrity_enabled",
  ai_triage: "ai_triage_enabled",
};

async function recordRun(
  companyId: string,
  healer: Healer,
  triggeredBy: string,
  actorId: string | null,
  startedAt: number,
  result: RunResult,
) {
  const sb = admin();
  const status = result.error
    ? "failed"
    : result.scanned === 0
      ? "empty"
      : result.flagged > 0 && result.fixed === 0
        ? "partial"
        : "success";
  const { data: run } = await sb
    .from("self_healing_runs")
    .insert({
      company_id: companyId,
      healer,
      triggered_by: triggeredBy,
      actor_id: actorId,
      status,
      scanned: result.scanned,
      fixed: result.fixed,
      flagged: result.flagged,
      duration_ms: Date.now() - startedAt,
      error_message: result.error ?? null,
      snapshot: result.snapshot ?? {},
    })
    .select("id")
    .single();
  if (run && result.actions.length > 0) {
    await sb.from("self_healing_actions").insert(
      result.actions.map((a) => ({
        run_id: run.id,
        company_id: companyId,
        healer,
        entity_type: a.entity_type,
        entity_id: a.entity_id,
        action: a.action,
        before: a.before ?? null,
        after: a.after ?? null,
        details: a.details ?? null,
        requires_review: a.requires_review ?? false,
      })),
    );
  }
}

async function runForCompany(
  companyId: string,
  triggeredBy: string,
  actorId: string | null,
  onlyHealer?: Healer,
) {
  const sb = admin();
  const { data: settings } = await sb
    .from("self_healing_settings")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  const healers: Healer[] = onlyHealer
    ? [onlyHealer]
    : ["risk_scoring", "work_orders", "data_integrity", "ai_triage"];

  for (const h of healers) {
    const enabled = settings ? (settings as Record<string, boolean>)[SETTING_COLUMN[h]] : true;
    if (enabled === false) continue;
    const startedAt = Date.now();
    let result: RunResult;
    try {
      result = await HEALERS[h](companyId);
    } catch (e) {
      result = { scanned: 0, fixed: 0, flagged: 0, actions: [], error: (e as Error).message };
    }
    await recordRun(companyId, h, triggeredBy, actorId, startedAt, result);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = admin();
    let body: { company_id?: string; healer?: Healer; triggered_by?: string } = {};
    try {
      body = await req.json();
    } catch {
      // empty body OK for scheduled trigger
    }

    // Auth: if user JWT present, restrict to their company
    let actorId: string | null = null;
    let scopedCompany: string | undefined = body.company_id;
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (token && token !== SERVICE_ROLE) {
      const userClient = createClient(PROJECT_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      actorId = user.id;
      const { data: profile } = await sb.from("profiles").select("company_id").eq("id", user.id).maybeSingle();
      if (!profile?.company_id) return new Response(JSON.stringify({ error: "no company" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      scopedCompany = profile.company_id;
    }

    const triggeredBy = body.triggered_by ?? (actorId ? "manual" : "scheduled");

    if (scopedCompany) {
      await runForCompany(scopedCompany, triggeredBy, actorId, body.healer);
      return new Response(JSON.stringify({ ok: true, company_id: scopedCompany }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Scheduled: iterate all companies
    const { data: companies } = await sb.from("companies").select("id");
    let processed = 0;
    for (const c of companies ?? []) {
      try {
        await runForCompany(c.id, triggeredBy, null, body.healer);
        processed++;
      } catch (e) {
        console.error(`self-heal failed for ${c.id}`, e);
      }
    }
    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("self-heal fatal", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});