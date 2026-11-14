import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { sendTemplateEmailWithLog } from "../_shared/transactional-email-templates/send-with-log.ts";
import { reserveOperation } from "../_shared/operationBudget.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false } });
    const { data, error } = await client.auth.getUser(jwt);
    const user = data?.user;
    if (error || !user) return reply(401, { error: "Unauthorized" });
    if (!user.email || !user.email_confirmed_at) return reply(403, { error: "Verified email required" });
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: profile, error: profileError } = await admin.from("profiles").select("company_id, first_name").eq("id", user.id).maybeSingle();
    if (profileError || !profile?.company_id) return reply(403, { error: "No company" });
    const { data: company, error: companyError } = await admin.from("companies").select("id, name, created_by, created_at").eq("id", profile.company_id).maybeSingle();
    const { data: subscription, error: subscriptionError } = await admin.from("subscriptions").select("status, trial_ends_at").eq("company_id", profile.company_id).maybeSingle();
    if (companyError || subscriptionError || !company || company.created_by !== user.id ||
        !(Date.parse(company.created_at) > Date.now() - 86400000) || subscription?.status !== "trialing" ||
        !(Date.parse(subscription.trial_ends_at) > Date.now())) return reply(403, { error: "New trial required" });
    if (!(await reserveOperation(user.id, "trial-signup"))) return reply(200, { success: true, reason: "already_notified" });
    // Identity, tenant and trial dates come solely from authoritative records.
    await sendTemplateEmailWithLog("trial-start", user.email, {
      idempotencyKey: `trial-start-${company.id}`,
      templateData: { firstName: profile.first_name, companyName: company.name, trialDays: 7, trialEndsAt: subscription.trial_ends_at, appUrl: "https://maintenease.com/dashboard" },
    });
    // Optional operator-owned address. No signup identity/contact data leaves the app.
    const ops = Deno.env.get("TRIAL_OPERATIONS_EMAIL");
    if (ops) await sendTemplateEmailWithLog("generic", ops, {
      idempotencyKey: `trial-signup-${company.id}`,
      templateData: { subject: "New MaintenEase trial", html: "<p>A new trial has started. Review the authorized admin dashboard for details.</p>" },
    });
    return reply(200, { success: true, trialDays: 7, trialEndsAt: subscription.trial_ends_at });
  } catch {
    console.error("notify-trial-signup failed");
    return reply(500, { success: false });
  }
});
