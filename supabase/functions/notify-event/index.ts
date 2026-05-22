import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");
const FROM = Deno.env.get("EMAIL_FROM") ?? "MaintenEase <noreply@maintenease.com>";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const resend = new Resend(RESEND_API_KEY);

// Escape user-controlled values before interpolating into HTML email bodies
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Recipient = {
  user_id: string;
  email: string | null;
  email_enabled: boolean;
  sms_enabled: boolean;
  phone: string | null;
  company_id?: string | null;
};

async function getRecipient(userId: string): Promise<Recipient | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, company_id, phone_number")
    .eq("id", userId)
    .maybeSingle();
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

async function alreadySent(eventType: string, refId: string, userId: string): Promise<boolean> {
  const { data } = await admin
    .from("notification_dispatch_log")
    .select("id")
    .eq("event_type", eventType)
    .eq("reference_id", refId)
    .eq("recipient_id", userId)
    .maybeSingle();
  return !!data;
}

async function recordSent(eventType: string, refId: string, userId: string) {
  await admin
    .from("notification_dispatch_log")
    .insert({ event_type: eventType, reference_id: refId, recipient_id: userId });
}

async function deliver(opts: {
  userId: string;
  title: string;
  body: string;
  referenceId?: string;
  eventType: string;
  dedupeKey?: string;
  smsBody?: string;
}) {
  const recipient = await getRecipient(opts.userId);
  if (!recipient) return;

  if (opts.dedupeKey) {
    if (await alreadySent(opts.eventType, opts.dedupeKey, opts.userId)) return;
  }

  // In-app
  await admin.from("notifications").insert({
    user_id: opts.userId,
    title: opts.title,
    body: opts.body,
    type: "in_app",
    reference_id: opts.referenceId,
    event_type: opts.eventType,
    company_id: recipient.company_id ?? null,
  });

  // Email
  if (recipient.email_enabled && recipient.email) {
    try {
      const sendRes = await resend.emails.send({
        from: FROM,
        to: [recipient.email],
        subject: opts.title,
        html: `<p>${opts.body}</p>`,
      });
      const providerMessageId =
        (sendRes as any)?.data?.id || (sendRes as any)?.id || null;
      await admin.from("notifications").insert({
        user_id: opts.userId,
        title: opts.title,
        body: opts.body,
        type: "email",
        reference_id: opts.referenceId,
        event_type: opts.eventType,
        company_id: recipient.company_id ?? null,
        provider_message_id: providerMessageId,
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
  }

  // SMS via Twilio gateway
  if (recipient.sms_enabled && recipient.phone && opts.smsBody && LOVABLE_API_KEY && TWILIO_API_KEY && TWILIO_FROM_NUMBER) {
    try {
      const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: recipient.phone,
          From: TWILIO_FROM_NUMBER,
          Body: opts.smsBody,
        }),
      });
      if (!res.ok) console.error("Twilio SMS failed:", res.status, await res.text());
      else {
        await admin.from("notifications").insert({
          user_id: opts.userId,
          title: opts.title,
          body: opts.smsBody,
          type: "sms",
          reference_id: opts.referenceId,
          event_type: opts.eventType,
          company_id: recipient.company_id ?? null,
        });
      }
    } catch (e) {
      console.error("Twilio SMS error:", e);
    }
  }

  if (opts.dedupeKey) await recordSent(opts.eventType, opts.dedupeKey, opts.userId);
}

async function handleWoAssigned(p: any) {
  const { work_order_id, title, assignee_id, actor_id } = p;
  if (!assignee_id || assignee_id === actor_id) return;
  await deliver({
    userId: assignee_id,
    title: `Work order assigned: ${title}`,
    body: `You have been assigned the work order "${esc(title)}".`,
    referenceId: work_order_id,
    eventType: "wo_assigned",
  });
}

async function handleWoStatusChanged(p: any) {
  const { work_order_id, title, new_status, creator_id, assignee_id, actor_id } = p;

  // Notify creator on completion
  if (new_status === "completed" && creator_id && creator_id !== actor_id) {
    await deliver({
      userId: creator_id,
      title: `Work order completed: ${title}`,
      body: `The work order "${esc(title)}" has been marked as completed.`,
      referenceId: work_order_id,
      eventType: "wo_status_changed",
    });
  }

  // Notify assignee for in-progress / other changes (when changed by someone else)
  if (
    assignee_id &&
    assignee_id !== actor_id &&
    new_status !== "completed" &&
    new_status !== "pending"
  ) {
    await deliver({
      userId: assignee_id,
      title: `Work order updated: ${title}`,
      body: `Status changed to "${esc(new_status)}" for "${esc(title)}".`,
      referenceId: work_order_id,
      eventType: "wo_status_changed",
    });
  }
}

async function handleScanDue() {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: wos } = await admin
    .from("work_orders")
    .select("id, title, due_date, assigned_to, created_by, status")
    .not("due_date", "is", null)
    .neq("status", "completed")
    .neq("status", "cancelled")
    .lt("due_date", soon);

  if (!wos) return;

  for (const wo of wos) {
    const due = new Date(wo.due_date as string);
    const isOverdue = due.getTime() < now.getTime();
    const eventType = isOverdue ? "wo_overdue" : "wo_due_soon";
    const targets = [wo.assigned_to, wo.created_by].filter(
      (v, i, arr) => v && arr.indexOf(v) === i,
    ) as string[];

    for (const userId of targets) {
      // Dedupe per day per WO per event
      const dedupeKey = `${wo.id}:${eventType}:${now.toISOString().slice(0, 10)}`;
      await deliver({
        userId,
        title: isOverdue
          ? `Overdue: ${wo.title}`
          : `Due soon: ${wo.title}`,
        body: isOverdue
          ? `The work order "${esc(wo.title)}" is overdue (due ${esc(due.toLocaleString())}).`
          : `The work order "${esc(wo.title)}" is due ${esc(due.toLocaleString())}.`,
        referenceId: wo.id,
        eventType,
        dedupeKey,
      });
    }
  }
}

async function handleReportShared(p: any) {
  const { report_name, report_id, recipients, sender_name, summary, actor_id } = p;
  if (!Array.isArray(recipients)) return;

  for (const userId of recipients as string[]) {
    if (userId === actor_id) continue;
    await deliver({
      userId,
      title: `Report shared: ${report_name}`,
      body: `${esc(sender_name || "A teammate")} shared the report "${esc(report_name)}" with you.${
        summary ? `<br/><br/>${esc(summary)}` : ""
      }`,
      referenceId: report_id || report_name,
      eventType: "report_shared",
    });
  }
}

function fmtTemp(tempC: number, unit: string): string {
  if ((unit || "F").toUpperCase() === "F") {
    const f = tempC * 9 / 5 + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

async function handleWeatherAlert(p: any) {
  const { company_id, location_id, location_name, kind, temperature_c, unit, min_c, max_c } = p;
  if (!company_id || !location_id) return;

  const tempStr = fmtTemp(Number(temperature_c), unit || "F");
  let title = "";
  let body = "";
  if (kind === "high") {
    title = `High temperature at ${location_name}`;
    body = `Temperature at ${esc(location_name)} is ${tempStr}, above the configured max (${max_c != null ? fmtTemp(Number(max_c), unit) : "n/a"}).`;
  } else if (kind === "low") {
    title = `Low temperature at ${location_name}`;
    body = `Temperature at ${esc(location_name)} is ${tempStr}, below the configured min (${min_c != null ? fmtTemp(Number(min_c), unit) : "n/a"}).`;
  } else if (kind === "recovered") {
    title = `Temperature back to normal at ${location_name}`;
    body = `Temperature at ${esc(location_name)} is ${tempStr}, back within configured range.`;
  } else {
    return;
  }

  // Notify all admins + managers in the company
  const { data: roles } = await admin
    .from("user_roles")
    .select("user_id, role")
    .eq("company_id", company_id)
    .in("role", ["administrator", "manager"]);

  const targets = Array.from(new Set((roles ?? []).map((r: any) => r.user_id))).filter(Boolean);

  for (const userId of targets) {
    await deliver({
      userId,
      title,
      body,
      referenceId: location_id,
      eventType: "weather_alert",
      dedupeKey: `${location_id}:${kind}:${new Date().toISOString().slice(0, 13)}`,
      smsBody: `${title}: ${tempStr}`,
    });
  }
}

async function handleNewPublicRequest(p: any, urgent: boolean) {
  const { request_id, company_id, title, description, location, contact_name, contact_email, contact_phone, photos } = p;
  if (!company_id || !request_id) return;

  const { data: roles } = await admin
    .from("user_roles")
    .select("user_id, role")
    .eq("company_id", company_id)
    .in("role", ["administrator", "manager"]);

  const targets = Array.from(new Set((roles ?? []).map((r: any) => r.user_id))).filter(Boolean);

  const subject = urgent ? `🚨 Urgent request: ${title}` : `New request: ${title}`;
  const photoArr: string[] = Array.isArray(photos) ? photos : [];
  const bodyHtml = `
    <p><strong>${urgent ? "An urgent maintenance request" : "A new maintenance request"} was just submitted via your public portal.</strong></p>
    <p><strong>Title:</strong> ${esc(title)}</p>
    ${description ? `<p><strong>Description:</strong><br/>${esc(description)}</p>` : ""}
    ${location ? `<p><strong>Location:</strong> ${esc(location)}</p>` : ""}
    <p><strong>Submitted by:</strong> ${esc(contact_name || "Anonymous")}${
      contact_email ? ` &lt;${esc(contact_email)}&gt;` : ""
    }${contact_phone ? ` · ${esc(contact_phone)}` : ""}</p>
    ${photoArr.length > 0 ? `<p><strong>Photos:</strong></p><p>${photoArr.map((u) => `<a href="${esc(u)}"><img src="${esc(u)}" alt="Request photo" style="max-width:140px;max-height:140px;margin:4px;border-radius:6px;border:1px solid #ddd"/></a>`).join("")}</p>` : ""}
    <p>Open the <a href="https://maintenease.com/requests">request inbox</a> to triage.</p>
  `.trim();
  const smsBody = urgent
    ? `URGENT request: ${title}${location ? ` @ ${location}` : ""}. Open the inbox to triage.`
    : `New request: ${title}${location ? ` @ ${location}` : ""}.`;

  for (const userId of targets) {
    await deliver({
      userId,
      title: subject,
      body: bodyHtml,
      referenceId: request_id,
      eventType: urgent ? "urgent_public_request" : "new_public_request",
      dedupeKey: request_id,
      smsBody: urgent ? smsBody : undefined,
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require shared secret — only the database (cron + triggers) may call this.
    if (!NOTIFY_SHARED_SECRET) {
      console.error("NOTIFY_SHARED_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const provided = req.headers.get("x-notify-secret");
    if (!provided || provided !== NOTIFY_SHARED_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event_type, payload } = await req.json();

    switch (event_type) {
      case "wo_assigned":
        await handleWoAssigned(payload);
        break;
      case "wo_status_changed":
        await handleWoStatusChanged(payload);
        break;
      case "wo_scan_due":
        await handleScanDue();
        break;
      case "report_shared":
        await handleReportShared(payload);
        break;
      case "weather_alert":
        await handleWeatherAlert(payload);
        break;
      case "urgent_public_request":
        await handleNewPublicRequest(payload, true);
        break;
      case "new_public_request":
        await handleNewPublicRequest(payload, false);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown event_type: ${event_type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-event error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});