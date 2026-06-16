import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";
import { generateText, Output } from "npm:ai";
import { z } from "npm:zod";

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function admin() {
  return createClient(PROJECT_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const TriageSchema = z.object({
  urgency: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["plumbing", "electrical", "hvac", "structural", "appliance", "safety", "general"]),
  suggested_assignee_role: z.enum(["technician", "manager", "administrator"]),
  summary: z.string(),
  reasoning: z.string(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require shared secret — only internal callers (pg_cron, self-heal) may invoke.
    const SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
    if (!SHARED_SECRET) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (req.headers.get("x-notify-secret") !== SHARED_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const requestId: string | undefined = body.request_id;
    if (!requestId) {
      return new Response(JSON.stringify({ error: "request_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = admin();
    const { data: request, error: reqErr } = await sb
      .from("public_requests")
      .select("id, company_id, title, description, location_text, type")
      .eq("id", requestId)
      .maybeSingle();

    if (reqErr || !request) {
      return new Response(JSON.stringify({ error: "request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if already triaged successfully
    const { data: existing } = await sb
      .from("public_request_triage")
      .select("id, status")
      .eq("request_id", requestId)
      .maybeSingle();
    if (existing && existing.status === "ready") {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) {
      await sb.from("public_request_triage").upsert({
        request_id: requestId,
        company_id: request.company_id,
        status: "failed",
        error_message: "LOVABLE_API_KEY not configured",
      }, { onConflict: "request_id" });
      return new Response(JSON.stringify({ error: "ai key missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    const prompt = `You are a maintenance request triage assistant. Analyze this incoming request and assign urgency, category, and a suggested assignee role.

Title: ${request.title ?? "(none)"}
Description: ${request.description ?? "(none)"}
Location: ${request.location_text ?? "(none)"}
Reported type: ${request.type ?? "(none)"}

Be conservative with "critical" — reserve it for safety hazards, flooding, no power/heat, or anything that puts people/property at immediate risk.`;

    try {
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
        experimental_output: Output.object({ schema: TriageSchema }),
      });

      await sb.from("public_request_triage").upsert({
        request_id: requestId,
        company_id: request.company_id,
        urgency: experimental_output.urgency,
        category: experimental_output.category,
        suggested_assignee_role: experimental_output.suggested_assignee_role,
        summary: experimental_output.summary,
        reasoning: experimental_output.reasoning,
        model_version: "google/gemini-3-flash-preview",
        status: "ready",
        error_message: null,
      }, { onConflict: "request_id" });

      return new Response(JSON.stringify({ ok: true, triage: experimental_output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = (e as Error).message;
      await sb.from("public_request_triage").upsert({
        request_id: requestId,
        company_id: request.company_id,
        status: "failed",
        error_message: msg.slice(0, 500),
      }, { onConflict: "request_id" });
      console.error("triage AI error", e);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("triage fatal", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});