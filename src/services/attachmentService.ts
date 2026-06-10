import { supabase } from "@/integrations/supabase/client";

export type AttachmentAction = "uploaded" | "deleted" | "reordered" | "updated";

export interface AttachmentAuditEntry {
  entityType: string;
  entityId: string;
  attachmentId?: string | null;
  action: AttachmentAction;
  details?: Record<string, unknown>;
}

export interface ReportAttachment {
  url: string;
  file_name: string | null;
  caption: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

/**
 * Lists the photo attachments for a report entity, ordered for display
 * (sort_order, then created_at). Throws on query failure.
 */
export async function listReportAttachments(reportEntityId: string): Promise<ReportAttachment[]> {
  const { data, error } = await supabase
    .from("attachments")
    .select("url,file_name,caption,description,sort_order,created_at")
    .eq("entity_type", "report")
    .eq("entity_id", reportEntityId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
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
