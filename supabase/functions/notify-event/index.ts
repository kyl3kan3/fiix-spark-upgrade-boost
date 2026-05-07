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
const FROM = "MaintenEase <noreply@maintain.rockcitydevelopment.com>";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const resend = new Resend(RESEND_API_KEY);

type Recipient = { user_id: string; email: string | null; email_enabled: boolean; company_id?: string | null };

async function getRecipient(userId: string): Promise<Recipient | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, company_id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null;

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("email_enabled, email_address")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    user_id: userId,
    email: prefs?.email_address || profile.email || null,
    email_enabled: prefs ? !!prefs.email_enabled : true,
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

  if (opts.dedupeKey) await recordSent(opts.eventType, opts.dedupeKey, opts.userId);
}

async function handleWoAssigned(p: any) {
  const { work_order_id, title, assignee_id, actor_id } = p;
  if (!assignee_id || assignee_id === actor_id) return;
  await deliver({
    userId: assignee_id,
    title: `Work order assigned: ${title}`,
    body: `You have been assigned the work order "${title}".`,
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
      body: `The work order "${title}" has been marked as completed.`,
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
      body: `Status changed to "${new_status}" for "${title}".`,
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
          ? `The work order "${wo.title}" is overdue (due ${due.toLocaleString()}).`
          : `The work order "${wo.title}" is due ${due.toLocaleString()}.`,
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
      body: `${sender_name || "A teammate"} shared the report "${report_name}" with you.${
        summary ? `<br/><br/>${summary}` : ""
      }`,
      referenceId: report_id || report_name,
      eventType: "report_shared",
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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