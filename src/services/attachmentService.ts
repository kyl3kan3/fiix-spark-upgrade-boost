import { supabase } from "@/integrations/supabase/client";

export type AttachmentAction = "uploaded" | "deleted" | "reordered" | "updated";

export interface AttachmentAuditEntry {
  entityType: string;
  entityId: string;
  attachmentId?: string | null;
  action: AttachmentAction;
  details?: Record<string, unknown>;
}

/**
 * Writes a row to the attachment audit log via the log_attachment_event RPC.
 *
 * Throws on failure — callers in audit code paths are expected to swallow the
 * error, since best-effort audit logging must never block the primary user
 * action (see src/lib/attachments/audit.ts).
 */
export async function insertAttachmentAuditEvent(entry: AttachmentAuditEntry): Promise<void> {
  const { error } = await supabase.rpc("log_attachment_event", {
    _entity_type: entry.entityType,
    _entity_id: entry.entityId,
    _action: entry.action,
    _attachment_id: (entry.attachmentId ?? null) as unknown as string | undefined,
    _details: (entry.details ?? {}) as never,
  });

  if (error) throw error;
}
