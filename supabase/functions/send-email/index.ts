import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeadersForRequest } from "../_shared/cors.ts";
import { sendTemplateEmailWithLog } from "../_shared/transactional-email-templates/send-with-log.ts";


interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  userId: string;
  notificationType: string;
  referenceId?: string;
}

// Minimal server-side HTML sanitizer: strip script/style/iframe/object/embed,
// inline event handlers (onclick=, onerror=, …), and dangerous URL schemes.
// This is defense-in-depth — callers should still prefer structured templates.
function sanitizeHtml(input: string): string {
  let html = String(input ?? "");
  // Drop dangerous elements entirely (tag + contents).
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
    "",
  );
  // Drop self-closing / unmatched dangerous tags.
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi,
    "",
  );
  // Remove inline event handlers: on*="…" / on*='…' / on*=value
  html = html.replace(/\son[a-z]+\s*=\s*"(?:\\.|[^"\\])*"/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*'(?:\\.|[^'\\])*'/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  // Neutralize javascript:/data:/vbscript: URLs in href/src.
  html = html.replace(
    /(href|src)\s*=\s*("|')\s*(?:javascript|data|vbscript):[^"']*\2/gi,
    '$1=$2#$2',
  );
  return html;
}

// Backwards-compatible shim: existing callers keep invoking `send-email` with
// raw subject+HTML, but we now forward to the managed Lovable Cloud
// transactional email pipeline (queue + verified sender domain). Resend is no
// longer used.
const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = corsHeadersForRequest(req);
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
    let invitationContent: { subject: string; html: string } | null = null;

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
        .select("email, invited_by, status, token, organization_id")
        .eq("id", referenceId)
        .maybeSingle();
      if (
        invite &&
        invite.status === "pending" &&
        invite.invited_by === authedUserId &&
        String(invite.email).trim().toLowerCase() === recipientLower
      ) {
        recipientAllowed = true;
        // Invitation emails use server-built content only; caller text is ignored.
        const { data: company } = await adminClient
          .from("companies").select("name").eq("id", (invite as any).organization_id).maybeSingle();
        const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
          .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const companyName = String((company as any)?.name ?? "your team").slice(0, 200);
        const inviteUrl = `https://maintenease.com/auth?signup=true&token=${encodeURIComponent(String((invite as any).token ?? ""))}`;
        invitationContent = {
          subject: `You're invited to join ${companyName.replace(/[\r\n]+/g, " ")} on MaintenEase`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2>You're invited to join ${esc(companyName)}!</h2><p>You've been invited to join <strong>${esc(companyName)}</strong> on MaintenEase, a maintenance management platform.</p><p style="margin:20px 0"><a href="${esc(inviteUrl)}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Accept Invitation</a></p><p>Or copy and paste this link into your browser:</p><p style="word-break:break-all;color:#666">${esc(inviteUrl)}</p><p>This invitation will expire in 7 days.</p><p>Best regards,<br>The MaintenEase Team</p></div>`,
        };
      }
    }

    if (!recipientAllowed) {
      return new Response(JSON.stringify({
        success: false,
        error: "Recipient not permitted for this sender",
      }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Send through Lovable's managed email delivery
    const safeSubject = invitationContent?.subject ?? String(subject).replace(/[\r\n]+/g, " ").slice(0, 300);
    const safeBody = invitationContent?.html ?? sanitizeHtml(body);
    const result = await sendTemplateEmailWithLog("generic", to, {
      templateData: { subject: safeSubject, html: safeBody },
      idempotencyKey: referenceId
        ? `${notificationType || "notification"}-${referenceId}`
        : undefined,
    });

    return new Response(JSON.stringify({ success: true, data: result }), {
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
