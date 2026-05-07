import { supabase } from "@/integrations/supabase/client";
import { sendEmailNotification, sendInAppNotification } from "./notificationSenders";

type Channels = { email: boolean; inApp: boolean; address: string | null };

async function getChannels(userId: string): Promise<Channels | null> {
  const [{ data: prefs }, { data: profile }] = await Promise.all([
    supabase
      .from("notification_preferences")
      .select("email_enabled, push_enabled, email_address")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("profiles").select("email").eq("id", userId).maybeSingle(),
  ]);

  if (!profile) return null;
  const address = prefs?.email_address || profile.email || null;
  // Default email_enabled = true if no prefs row exists yet
  const email = prefs ? !!prefs.email_enabled : true;
  return { email, inApp: true, address };
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  referenceId?: string
) {
  try {
    const ch = await getChannels(userId);
    if (!ch) return;

    if (ch.inApp) {
      await sendInAppNotification(title, body, userId, referenceId).catch((e) =>
        console.warn("In-app notification failed:", e)
      );
    }

    if (ch.email && ch.address) {
      const html = `<p>${body}</p>`;
      await sendEmailNotification(ch.address, title, html, userId, referenceId).catch(
        (e) => console.warn("Email notification failed:", e)
      );
    }
  } catch (err) {
    console.warn("notifyUser failed:", err);
  }
}

export async function notifyWorkOrderAssigned(params: {
  workOrderId: string;
  title: string;
  assigneeId: string;
  actorId: string;
}) {
  if (params.assigneeId === params.actorId) return;
  await notifyUser(
    params.assigneeId,
    `Work order assigned: ${params.title}`,
    `You have been assigned the work order "${params.title}".`,
    params.workOrderId
  );
}

export async function notifyWorkOrderCompleted(params: {
  workOrderId: string;
  title: string;
  creatorId: string;
  actorId: string;
}) {
  if (params.creatorId === params.actorId) return;
  await notifyUser(
    params.creatorId,
    `Work order completed: ${params.title}`,
    `The work order "${params.title}" has been marked as completed.`,
    params.workOrderId
  );
}