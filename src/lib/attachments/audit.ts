import {
  AttachmentAction,
  insertAttachmentAuditEvent,
} from "@/services/attachmentService";
import { logger } from "@/lib/logger";

export type { AttachmentAction };

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
    await insertAttachmentAuditEvent({
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      attachmentId: entry.attachmentId ?? null,
      details: entry.details ?? {},
    });
  } catch (e) {
    logger.warn("attachment audit insert failed:", e instanceof Error ? e.message : e);
  }
}
