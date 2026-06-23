import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "claude-sonnet-4-6";
const MAX_TURNS = 6;

const SYSTEM_PROMPT = `You are the MaintenEase maintenance assistant, embedded in a CMMS app.
You help maintenance teams understand their data and get things done.

- Use the read tools to answer questions about assets, work orders, costs, energy usage, and equipment risk. Prefer calling a tool over guessing; if a tool returns nothing, say so plainly.
- When the user asks to create/schedule work, call propose_work_order; to log a cost/expense, call propose_cost; to log energy/power usage, call propose_energy_reading. These do NOT write anything — they draft a proposal the user must confirm in the UI. Tell them you've drafted it and they can confirm.
- Be concise and practical. Use plain language and small markdown tables when helpful. Never invent asset names, numbers, or ids; only use values returned by tools.
- All data is automatically scoped to the user's company — never ask for a company id.`;

const tools = [
  {
    name: "get_assets",
    description: "List equipment/assets, optionally filtered by a name substring or status.",
    input_schema: {
      type: "object",
      properties: {
        name_contains: { type: "string", description: "Case-insensitive substring to filter asset names." },
        status: { type: "string", description: "Filter by asset status." },
        limit: { type: "number", description: "Max rows (default 25)." },
      },
    },
  },
  {
    name: "get_work_orders",
    description: "List work orders, optionally filtered by status (pending, in_progress, completed, cancelled).",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_cost_summary",
    description: "Summarize maintenance costs over the last N days (total and by category/type).",
    input_schema: {
      type: "object",
      properties: { since_days: { type: "number", description: "Default 180." } },
    },
  },
  {
    name: "get_energy_summary",
    description: "Summarize energy usage (total kWh and cost) over the last N days.",
    input_schema: {
      type: "object",
      properties: { since_days: { type: "number", description: "Default 365." } },
    },
  },
  {
    name: "get_high_risk_assets",
    description: "List the highest predictive-maintenance risk assets.",
    input_schema: {
      type: "object",
      properties: { limit: { type: "number", description: "Default 10." } },
    },
  },
  {
    name: "propose_work_order",
    description:
      "Draft a work order for the user to confirm. Does NOT create it. Use when the user wants to create/schedule maintenance work.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        asset_id: { type: "string", description: "Optional asset id from get_assets." },
        due_date: { type: "string", description: "Optional ISO date." },
      },
      required: ["title"],
    },
  },
  {
    name: "propose_cost",
    description:
      "Draft a maintenance cost entry for the user to confirm. Does NOT create it. Use when the user wants to log/record a cost or expense.",
    input_schema: {
      type: "object",
      properties: {
        amount: { type: "number" },
        category: { type: "string", enum: ["labor", "parts", "contractor", "downtime", "other"] },
        maintenance_type: { type: "string", enum: ["preventive", "reactive", "other"] },
        currency: { type: "string", description: "3-letter code, default USD." },
        asset_id: { type: "string", description: "Optional asset id from get_assets." },
        description: { type: "string" },
      },
      required: ["amount"],
    },
  },
  {
    name: "propose_energy_reading",
    description:
      "Draft an energy (kWh) reading for the user to confirm. Does NOT create it. Use when the user wants to log/record energy or power usage.",
    input_schema: {
      type: "object",
      properties: {
        kwh: { type: "number" },
        cost: { type: "number", description: "Optional cost for the reading." },
        currency: { type: "string", description: "3-letter code, default USD." },
        asset_id: { type: "string", description: "Optional asset id from get_assets." },
        meter_label: { type: "string", description: "Optional free-text meter name." },
      },
      required: ["kwh"],
    },
  },
];

// deno-lint-ignore no-explicit-any
type Db = ReturnType<typeof createClient>;

// deno-lint-ignore no-explicit-any
async function executeTool(db: Db, name: string, input: any, proposals: any[]): Promise<string> {
  switch (name) {
    case "get_assets": {
      let q = db.from("assets").select("id, name, status, location").order("name").limit(input?.limit ?? 25);
      if (input?.name_contains) q = q.ilike("name", `%${input.name_contains}%`);
      if (input?.status) q = q.eq("status", input.status);
      const { data, error } = await q;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    case "get_work_orders": {
      let q = db
        .from("work_orders")
        .select("id, title, status, priority, due_date, asset_id")
        .order("due_date", { ascending: true })
        .limit(input?.limit ?? 25);
      if (input?.status) q = q.eq("status", input.status);
      const { data, error } = await q;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    case "get_cost_summary": {
      const since = new Date();
      since.setDate(since.getDate() - (input?.since_days ?? 180));
      const { data, error } = await db
        .from("maintenance_costs")
        .select("amount, category, maintenance_type, currency")
        .gte("incurred_at", since.toISOString())
        .limit(5000);
      if (error) return JSON.stringify({ error: error.message });
      const byCategory: Record<string, number> = {};
      const byType: Record<string, number> = {};
      let total = 0;
      for (const r of data ?? []) {
        const amt = Number(r.amount) || 0;
        total += amt;
        byCategory[r.category] = (byCategory[r.category] ?? 0) + amt;
        byType[r.maintenance_type] = (byType[r.maintenance_type] ?? 0) + amt;
      }
      return JSON.stringify({ total, byCategory, byType, count: data?.length ?? 0, currency: data?.[0]?.currency ?? "USD" });
    }
    case "get_energy_summary": {
      const since = new Date();
      since.setDate(since.getDate() - (input?.since_days ?? 365));
      const { data, error } = await db
        .from("energy_readings")
        .select("kwh, cost, currency")
        .gte("reading_date", since.toISOString())
        .limit(5000);
      if (error) return JSON.stringify({ error: error.message });
      let kwh = 0;
      let cost = 0;
      for (const r of data ?? []) {
        kwh += Number(r.kwh) || 0;
        cost += Number(r.cost) || 0;
      }
      return JSON.stringify({ total_kwh: kwh, total_cost: cost, count: data?.length ?? 0, currency: data?.[0]?.currency ?? "USD" });
    }
    case "get_high_risk_assets": {
      const { data, error } = await db
        .from("asset_risk_scores")
        .select("asset_id, risk_score, risk_level, recommended_action")
        .order("risk_score", { ascending: false })
        .limit(input?.limit ?? 10);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    case "propose_work_order": {
      proposals.push({
        type: "work_order",
        title: input?.title ?? "",
        description: input?.description ?? "",
        priority: input?.priority ?? "medium",
        asset_id: input?.asset_id ?? null,
        due_date: input?.due_date ?? null,
      });
      return JSON.stringify({ ok: true, note: "Proposal recorded. The user will confirm it in the UI." });
    }
    case "propose_cost": {
      proposals.push({
        type: "cost",
        amount: input?.amount ?? 0,
        category: input?.category ?? "other",
        maintenance_type: input?.maintenance_type ?? "reactive",
        currency: input?.currency ?? "USD",
        asset_id: input?.asset_id ?? null,
        description: input?.description ?? null,
      });
      return JSON.stringify({ ok: true, note: "Cost proposal recorded. The user will confirm it in the UI." });
    }
    case "propose_energy_reading": {
      proposals.push({
        type: "energy",
        kwh: input?.kwh ?? 0,
        cost: input?.cost ?? null,
        currency: input?.currency ?? "USD",
        asset_id: input?.asset_id ?? null,
        meter_label: input?.meter_label ?? null,
      });
      return JSON.stringify({ ok: true, note: "Energy proposal recorded. The user will confirm it in the UI." });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Only POST allowed", { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Assistant is not configured (missing API key)." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RLS-scoped client bound to the caller's JWT — all reads/writes are company-scoped automatically.
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claims, error: claimsErr } = await db.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const history = Array.isArray(body?.messages) ? body.messages : [];
    // deno-lint-ignore no-explicit-any
    const messages: any[] = history
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: m.content }));

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // deno-lint-ignore no-explicit-any
    const proposals: any[] = [];
    let reply = "";

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 1024, system: SYSTEM_PROMPT, tools, messages }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Anthropic error:", resp.status, errText);
        return new Response(JSON.stringify({ error: "The assistant is temporarily unavailable." }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const content = data?.content ?? [];
      reply = content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();

      if (data?.stop_reason !== "tool_use") break;

      const toolUses = content.filter((b: any) => b.type === "tool_use");
      const toolResults = [];
      for (const tu of toolUses) {
        const result = await executeTool(db, tu.name, tu.input, proposals);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: result });
      }
      messages.push({ role: "assistant", content });
      messages.push({ role: "user", content: toolResults });
    }

    return new Response(JSON.stringify({ reply: reply || "…", proposals }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("maintenance-assistant error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
