/**
 * Pure types + helpers for the maintenance assistant. No data-layer / React
 * imports so the proposal normalization is unit-testable in isolation.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

const PRIORITIES: WorkOrderPriority[] = ["low", "medium", "high", "urgent"];

/** A confirmation-gated action the assistant proposes; the user approves before it runs. */
export interface WorkOrderProposal {
  type: "work_order";
  title: string;
  description: string;
  priority: WorkOrderPriority;
  asset_id: string | null;
  due_date: string | null;
}

export type AssistantProposal = WorkOrderProposal;

export interface RawWorkOrderProposal {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  asset_id?: unknown;
  due_date?: unknown;
}

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Coerce a model-proposed work order into a safe, complete shape with sensible
 * defaults (matching the work-order form's validation: title ≥ 3, description ≥ 5).
 * Returns null when there isn't enough to act on.
 */
export function normalizeWorkOrderProposal(raw: RawWorkOrderProposal): WorkOrderProposal | null {
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (title.length < 3) return null;

  let description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (description.length < 5) {
    description = `Auto-drafted from assistant request: ${title}`;
  }

  const priority: WorkOrderPriority =
    typeof raw.priority === "string" && (PRIORITIES as string[]).includes(raw.priority)
      ? (raw.priority as WorkOrderPriority)
      : "medium";

  const asset_id =
    typeof raw.asset_id === "string" && raw.asset_id.trim() !== "" ? raw.asset_id.trim() : null;

  return { type: "work_order", title, description, priority, asset_id, due_date: toIsoOrNull(raw.due_date) };
}
