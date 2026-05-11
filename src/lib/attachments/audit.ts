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
    const { error } = await (supabase as any).rpc("log_attachment_event", {
      _entity_type: entry.entityType,
      _entity_id: entry.entityId,
      _action: entry.action,
      _attachment_id: entry.attachmentId ?? null,
      _details: (entry.details ?? {}) as never,
    });
    if (error) console.warn("attachment audit insert failed:", error.message);
  } catch (e) {
    console.warn("attachment audit insert threw:", e);
  }
}