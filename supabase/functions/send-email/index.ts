import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  userId: string;
  notificationType: string;
  referenceId?: string;
}

// Backwards-compatible shim: existing callers keep invoking `send-email` with
// raw subject+HTML, but we now forward to the managed Lovable Cloud
// transactional email pipeline (queue + verified sender domain). Resend is no
// longer used.
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    const authedUserId = userData?.user?.id;
    if (userError || !authedUserId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { to, subject, body, userId, notificationType, referenceId } =
      (await req.json()) as EmailNotificationRequest;

    if (!to || !subject || !body || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: to, subject, body, userId",
      }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (userId !== authedUserId) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Restrict recipient: own email, or invitee for invitation notifications
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const recipientLower = String(to).trim().toLowerCase();
    let recipientAllowed = false;

    const { data: profile } = await adminClient
      .from("profiles").select("email").eq("id", authedUserId).maybeSingle();
    const { data: prefs } = await adminClient
      .from("notification_preferences").select("email_address").eq("user_id", authedUserId).maybeSingle();
    const ownEmails = new Set(
      [profile?.email, (prefs as any)?.email_address]
        .filter(Boolean)
        .map((e: string) => e.trim().toLowerCase()),
    );
    if (ownEmails.has(recipientLower)) recipientAllowed = true;

    if (!recipientAllowed && notificationType === "invitation" && referenceId) {
      const { data: invite } = await adminClient
        .from("organization_invitations")
        .select("email, invited_by, status")
        .eq("id", referenceId)
        .maybeSingle();
      if (
        invite &&
        invite.invited_by === authedUserId &&
        String(invite.email).trim().toLowerCase() === recipientLower
      ) {
        recipientAllowed = true;
      }
    }

    if (!recipientAllowed) {
      return new Response(JSON.stringify({
        success: false,
        error: "Recipient not permitted for this sender",
      }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Forward to the managed transactional email pipeline
    const forwardRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        templateName: "generic",
        recipientEmail: to,
        templateData: { subject, html: body },
      }),
    });
    const forwardJson = await forwardRes.json().catch(() => ({}));
    if (!forwardRes.ok) {
      console.error("send-email pipeline error", forwardRes.status, forwardJson);
      return new Response(JSON.stringify({
        success: false,
        error: "Email sending failed.",
      }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, data: forwardJson }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-email error", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Email sending failed.",
    }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
