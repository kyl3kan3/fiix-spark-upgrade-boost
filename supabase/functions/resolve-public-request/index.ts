import { reserveOperation } from "../_shared/operationBudget.ts";
import { sendTemplateEmailWithLog } from "../_shared/transactional-email-templates/send-with-log.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("EMAIL_FROM") ?? "MaintenEase <noreply@maintenease.com>";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const BodySchema = z.object({
  requestId: z.string().uuid(),
});

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    const actorId = userData?.user?.id;
    if (userError || !actorId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: actorProfile, error: actorProfileError } = await admin
      .from("profiles")
      .select("company_id, first_name, last_name")
      .eq("id", actorId)
      .single();

    if (actorProfileError || !actorProfile?.company_id) {
      return new Response(JSON.stringify({ error: "No company context" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId)
      .eq("company_id", actorProfile.company_id)
      .in("role", ["administrator", "manager"]);

    if (!roleRows || roleRows.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request, error: requestError } = await admin
      .from("public_requests")
      .select("id, company_id, title, description, location_text, contact_name, contact_email, contact_phone, type, status, photos")
      .eq("id", parsed.data.requestId)
      .single();

    if (requestError || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.company_id !== actorProfile.company_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.status === "resolved") {
      return new Response(JSON.stringify({ ok: true, emailSent: false, reason: "already_resolved" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.status !== "resolved") {
      const { error: updateError } = await admin
        .from("public_requests")
        .update({ status: "resolved" })
        .eq("id", request.id);

      if (updateError) throw updateError;
    }

    if (!request.contact_email) {
      return new Response(JSON.stringify({ ok: true, emailSent: false, reason: "missing_contact_email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!await reserveOperation(actorId, "resolve-public-request")) return new Response(JSON.stringify({ error: "Notification limit reached" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: claimed, error: claimError } = await admin.rpc("claim_request_notification", { p_request_id: request.id });
    if (claimError) throw new Error("Notification claim unavailable");
    if (!claimed) return new Response(JSON.stringify({ ok: true, emailSent: false, reason: "already_notified" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Public request fields are unverified content, never a trusted outbound message.
    const subject = "Maintenance request resolved";
    const html = "<p>Your maintenance request has been marked as resolved.</p><p>If the issue persists, contact your property team through your usual channel.</p>";

    try {
      const result = await sendTemplateEmailWithLog("generic", request.contact_email, { templateData: { subject, html }, idempotencyKey: `request-resolved-${request.id}` });
      return new Response(JSON.stringify({ ok: true, emailSent: result.sent }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (emailError) {
      console.error("resolve-public-request email error:", emailError);
      return new Response(JSON.stringify({ ok: true, emailSent: false, reason: "email_send_failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("resolve-public-request error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});