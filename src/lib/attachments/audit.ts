import { supabase } from "@/integrations/supabase/client";

export type AttachmentAction = "uploaded" | "deleted" | "reordered" | "updated";

export interface AuditEntryInput {
  companyId: string;
  entityType: string;
  entityId: string;
  attachmentId?: string | null;
  action: AttachmentAction;
  actorId: string;
  details?: Record<string, unknown>;
}

/**
 * Best-effort write to the attachment audit log. Failures are logged but
 * never thrown so they cannot block the primary user action.
 */
export async function logAttachmentEvent(entry: AuditEntryInput): Promise<void> {
  try {
    const { error } = await supabase.from("attachment_audit_log").insert([
      {
        company_id: entry.companyId,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        attachment_id: entry.attachmentId ?? null,
        action: entry.action,
        actor_id: entry.actorId,
        details: (entry.details ?? {}) as never,
      },
    ]);
    if (error) console.warn("attachment audit insert failed:", error.message);
  } catch (e) {
    console.warn("attachment audit insert threw:", e);
  }
}