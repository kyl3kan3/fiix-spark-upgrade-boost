import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");
const FROM = Deno.env.get("EMAIL_FROM") ?? "MaintenEase <noreply@maintenease.com>";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const BodySchema = z.object({
  companyId: z.string().uuid(),
  type: z.enum(["standard", "urgent"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  location_text: z.string().trim().max(300).optional().nullable(),
  contact_name: z.string().trim().max(120).optional().nullable(),
  contact_email: z.string().trim().email().max(255).optional().or(z.literal("")).nullable(),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  photos: z.array(z.string().url()).max(6).optional().default([]),
  user_agent: z.string().max(500).optional().nullable(),
});

type Recipient = {
  user_id: string;
  email: string | null;
  email_enabled: boolean;
  sms_enabled: boolean;
  phone: string | null;
  company_id?: string | null;
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getRecipient(userId: string): Promise<Recipient | null> {
  const { data: profile } = await admin.from("profiles").select("id, email, company_id, phone_number").eq("id", userId).maybeSingle();
  if (!profile) return null;

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("email_enabled, sms_enabled, email_address, phone_number")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    user_id: userId,
    email: prefs?.email_address || profile.email || null,
    email_enabled: prefs ? !!prefs.email_enabled : true,
    sms_enabled: prefs ? !!prefs.sms_enabled : false,
    phone: prefs?.phone_number || (profile as any).phone_number || null,
    company_id: (profile as any).company_id || null,
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) return null;

  const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any)?.message || (data as any)?.error || `Gateway HTTP ${response.status}`);
  return (data as any)?.data?.id || (data as any)?.id || null;
}

function buildRequestDetailsHtml(payload: {
  title: string;
  description?: string | null;
  location_text?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  photos?: string[];
}) {
  return `
      <p><strong>Title:</strong> ${esc(payload.title)}</p>
      ${payload.description ? `<p><strong>Description:</strong><br/>${esc(payload.description)}</p>` : ""}
      ${payload.location_text ? `<p><strong>Location:</strong> ${esc(payload.location_text)}</p>` : ""}
      <p><strong>Submitted by:</strong> ${esc(payload.contact_name || "Anonymous")}${payload.contact_email ? ` &lt;${esc(payload.contact_email)}&gt;` : ""}${payload.contact_phone ? ` · ${esc(payload.contact_phone)}` : ""}</p>
      ${(payload.photos ?? []).length ? `<p><strong>Photos:</strong></p><p>${(payload.photos ?? []).map((u) => `<a href="${esc(u)}">${esc(u)}</a>`).join("<br/>")}</p>` : ""}
    `.trim();
}

async function sendSubmitterConfirmationEmail(payload: z.infer<typeof BodySchema>) {
  if (!payload.contact_email) return null;

  const subject = `We received your request: ${payload.title}`;
  const html = `
    <p><strong>Thanks — your maintenance request has been received.</strong></p>
    <p>We’ve shared it with the property team and they’ll review it shortly.</p>
    ${buildRequestDetailsHtml(payload)}
  `.trim();

  return await sendEmail(payload.contact_email, subject, html);
}

async function sendSms(to: string, body: string) {
  if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_FROM_NUMBER) return;
  const response = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: body }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio HTTP ${response.status}: ${text}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = parsed.data;
    const { data: request, error: insertError } = await admin.from("public_requests").insert({
      company_id: payload.companyId,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      location_text: payload.location_text || null,
      contact_name: payload.contact_name || null,
      contact_email: payload.contact_email || null,
      contact_phone: payload.contact_phone || null,
      photos: payload.photos,
      user_agent: payload.user_agent || null,
    }).select("id").single();

    if (insertError || !request) throw insertError ?? new Error("Failed to create request");

    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("company_id", payload.companyId)
      .in("role", ["administrator", "manager"]);

    const title = payload.type === "urgent" ? `🚨 Urgent request: ${payload.title}` : `New request: ${payload.title}`;
    const bodyHtml = `
      <p><strong>${payload.type === "urgent" ? "An urgent maintenance request" : "A new maintenance request"} was just submitted via your public portal.</strong></p>
      ${buildRequestDetailsHtml(payload)}
      <p>Open the request inbox to triage.</p>
    `.trim();

    const smsBody = payload.type === "urgent"
      ? `URGENT request: ${payload.title}${payload.location_text ? ` @ ${payload.location_text}` : ""}. Open the inbox to triage.`
      : `New request: ${payload.title}${payload.location_text ? ` @ ${payload.location_text}` : ""}.`;

    for (const role of roles ?? []) {
      const recipient = await getRecipient((role as any).user_id);
      if (!recipient) continue;

      await admin.from("notifications").insert({
        user_id: recipient.user_id,
        title,
        body: bodyHtml,
        type: "in_app",
        reference_id: request.id,
        event_type: payload.type === "urgent" ? "urgent_public_request" : "new_public_request",
        company_id: recipient.company_id ?? null,
      });

      if (recipient.email_enabled && recipient.email) {
        const providerMessageId = await sendEmail(recipient.email, title, bodyHtml);
        await admin.from("notifications").insert({
          user_id: recipient.user_id,
          title,
          body: bodyHtml,
          type: "email",
          reference_id: request.id,
          event_type: payload.type === "urgent" ? "urgent_public_request" : "new_public_request",
          company_id: recipient.company_id ?? null,
          provider_message_id: providerMessageId,
        });
      }

      if (payload.type === "urgent" && recipient.sms_enabled && recipient.phone) {
        await sendSms(recipient.phone, smsBody);
        await admin.from("notifications").insert({
          user_id: recipient.user_id,
          title,
          body: smsBody,
          type: "sms",
          reference_id: request.id,
          event_type: "urgent_public_request",
          company_id: recipient.company_id ?? null,
        });
      }
    }

    if (payload.contact_email) {
      const providerMessageId = await sendSubmitterConfirmationEmail(payload);
      await admin.from("notifications").insert({
        user_id: (roles?.[0] as any)?.user_id ?? request.id,
        title: `Submitter confirmation: ${payload.title}`,
        body: `Confirmation email sent to ${payload.contact_email}`,
        type: "email",
        reference_id: request.id,
        event_type: "public_request_submitter_confirmation",
        company_id: payload.companyId,
        provider_message_id: providerMessageId,
      });
    }

    return new Response(JSON.stringify({ ok: true, requestId: request.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("submit-public-request error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});