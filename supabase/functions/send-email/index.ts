import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import sanitizeHtml from "npm:sanitize-html@2.18.2";
import { sendTemplateEmailWithLog } from "../_shared/transactional-email-templates/send-with-log.ts";
import { reserveOperation } from "../_shared/operationBudget.ts";
import { boundedJson } from "../_shared/requestBody.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false } });
    const { data, error } = await userClient.auth.getUser(jwt);
    const user = data?.user;
    if (error || !user) return reply(401, { error: "Unauthorized" });
    const input = await boundedJson(req);
    const { to, subject, body, userId, notificationType, referenceId } = input ?? {};
    if (typeof to !== "string" || to.length > 254 || typeof subject !== "string" || subject.length > 300 || typeof body !== "string" || !subject || !body) return reply(400, { error: "Invalid email request" });
    if (userId !== user.id) return reply(403, { error: "Forbidden" });
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const recipient = to.trim().toLowerCase();
    let template = "generic";
    let templateData: Record<string, unknown>;
    let idempotencyKey: string | undefined;
    if (notificationType === "invitation") {
      if (typeof referenceId !== "string") return reply(400, { error: "Invitation required" });
      const { data: invite, error: inviteError } = await admin.from("organization_invitations")
        .select("email, invited_by, organization_id, status, token, created_at").eq("id", referenceId).maybeSingle();
      if (inviteError || !invite || invite.status !== "pending" || invite.invited_by !== user.id || !invite.token ||
          String(invite.email).trim().toLowerCase() !== recipient ||
          !(Date.parse(invite.created_at) > Date.now() - 7 * 86400000)) return reply(403, { error: "Invitation unavailable" });
      const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).maybeSingle();
      const { data: roles, error: roleError } = await admin.from("user_roles").select("role")
        .eq("user_id", user.id).eq("company_id", invite.organization_id).eq("role", "administrator");
      if (profile?.company_id !== invite.organization_id || roleError || !roles?.length) return reply(403, { error: "Forbidden" });
      const { data: company, error: companyError } = await admin.from("companies").select("name").eq("id", invite.organization_id).single();
      if (companyError) throw new Error("Company unavailable");
      template = "invitation";
      templateData = { companyName: company.name, inviteUrl: `https://maintenease.com/auth?signup=true&token=${encodeURIComponent(invite.token)}` };
      idempotencyKey = `invitation-${referenceId}`;
    } else {
      // Profile and notification-preference addresses are editable; only Auth proves ownership.
      if (!user.email_confirmed_at || !user.email || user.email.trim().toLowerCase() !== recipient) return reply(403, { error: "Recipient not permitted" });
      templateData = { subject: subject.replace(/[\r\n]/g, " "), html: sanitizeHtml(body, {
        allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "a", "h1", "h2", "h3", "table", "tr", "td", "th", "thead", "tbody"],
        allowedAttributes: { a: ["href"] }, allowedSchemes: ["https", "http", "mailto"], allowProtocolRelative: false,
      }) };
    }
    if (!(await reserveOperation(user.id, "send-email"))) return reply(429, { error: "Email limit reached" });
    const result = await sendTemplateEmailWithLog(template, recipient, { templateData, idempotencyKey });
    return reply(200, { success: true, data: result });
  } catch (error) {
    if (error instanceof RangeError) return reply(413, { error: "Request too large" });
    if (error instanceof SyntaxError || error instanceof TypeError) return reply(400, { error: "Invalid request" });
    console.error("send-email failed");
    return reply(500, { success: false, error: "Email sending failed" });
  }
});
