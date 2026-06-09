import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fixed internal recipient — never accepted from the client to prevent
// abuse of the verified sending domain for arbitrary recipients.
const INTERNAL_RECIPIENT = "Kyle@decent4.com";

// Single source of truth on the server. Keep in sync with `TRIAL_DAYS`
// in src/constants/trial.ts and the Paddle price trial_period settings.
const TRIAL_DAYS = 7;

interface Body {
  company?: string;
  companyId?: string;
}

const escape = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "").trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    const user = userData?.user;
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Body = {};
    try { body = await req.json(); } catch { /* allow empty */ }
    const company = String(body.company ?? "").slice(0, 200);
    const companyId = String(body.companyId ?? "").slice(0, 64);

    // Load profile server-side so we never trust client-supplied identity.
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name,last_name,phone_number,email")
      .eq("id", user.id)
      .maybeSingle();

    const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
    const userEmail = profile?.email ?? user.email ?? "";
    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();
    const html = `
      <p>A new company just started a MaintenEase trial.</p>
      <ul>
        <li><strong>Company:</strong> ${escape(company)}</li>
        <li><strong>Name:</strong> ${escape(fullName)}</li>
        <li><strong>Email:</strong> ${escape(userEmail)}</li>
        <li><strong>Phone:</strong> ${escape(profile?.phone_number ?? "")}</li>
        <li><strong>Company ID:</strong> ${escape(companyId)}</li>
        <li><strong>Trial length:</strong> ${TRIAL_DAYS} days</li>
        <li><strong>When:</strong> ${escape(new Date().toISOString())}</li>
      </ul>
    `;

    const sendEmail = (payload: Record<string, unknown>) =>
      fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify(payload),
      });

    // 1) Internal ops notification.
    const forwardRes = await sendEmail({
      templateName: "generic",
      recipientEmail: INTERNAL_RECIPIENT,
      idempotencyKey: `trial-signup-${companyId || user.id}`,
      templateData: {
        subject: `New trial signup: ${company}`,
        preheader: `${company} just started a trial`,
        html,
      },
    });

    // 2) Confirmation email to the new trial user. Fire-and-forget — never
    //    block the response on the welcome email.
    if (userEmail) {
      sendEmail({
        templateName: "trial-start",
        recipientEmail: userEmail,
        idempotencyKey: `trial-start-${companyId || user.id}`,
        templateData: {
          firstName: profile?.first_name ?? undefined,
          companyName: company,
          trialDays: TRIAL_DAYS,
          trialEndsAt,
          appUrl: "https://maintenease.com/dashboard",
        },
      }).catch((err) => console.error("trial-start email failed", err));
    }

    if (!forwardRes.ok) {
      const text = await forwardRes.text().catch(() => "");
      console.error("notify-trial-signup forward failed", forwardRes.status, text);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, trialDays: TRIAL_DAYS, trialEndsAt }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-trial-signup error", err);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});