import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Webhook } from "https://esm.sh/svix@1.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!secret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(JSON.stringify({ error: "Missing signature headers" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    let payload: any;
    try {
      const wh = new Webhook(secret);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (e) {
      console.error("Webhook signature verification failed:", e);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resend webhook shape: { type, created_at, data: { email_id, to, ... } }
    const eventType: string = payload?.type || "unknown";
    const data = payload?.data || {};
    const messageId: string | undefined = data.email_id || data.id;
    const recipient = Array.isArray(data.to) ? data.to[0] : data.to;
    const occurredAt = payload?.created_at || new Date().toISOString();

    if (!messageId) {
      return new Response(JSON.stringify({ ok: true, ignored: "no message id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("email_events").insert({
      provider_message_id: messageId,
      event_type: eventType,
      recipient_email: recipient || null,
      occurred_at: occurredAt,
      raw: payload,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("resend-webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});