/**
 * Pure types + helpers for the maintenance assistant. No data-layer / React
 * imports so the proposal normalization is unit-testable in isolation.
 */

import {
  COST_CATEGORIES,
  MAINTENANCE_TYPES,
  type CostCategory,
  type MaintenanceType,
} from "@/lib/costAnalytics";

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

export interface CostProposal {
  type: "cost";
  category: CostCategory;
  maintenance_type: MaintenanceType;
  amount: number;
  currency: string;
  asset_id: string | null;
  description: string | null;
}

export interface EnergyProposal {
  type: "energy";
  kwh: number;
  cost: number | null;
  currency: string;
  asset_id: string | null;
  meter_label: string | null;
}

export type AssistantProposal = WorkOrderProposal | CostProposal | EnergyProposal;

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : null;
}

export interface RawWorkOrderProposal {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  asset_id?: unknown;
  due_date?: unknown;
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

  const asset_id = str(raw.asset_id);

  return { type: "work_order", title, description, priority, asset_id, due_date: toIsoOrNull(raw.due_date) };
}

export interface RawCostProposal {
  category?: unknown;
  maintenance_type?: unknown;
  amount?: unknown;
  currency?: unknown;
  asset_id?: unknown;
  description?: unknown;
}

/** Coerce a model-proposed cost entry. Returns null without a valid non-negative amount. */
export function normalizeCostProposal(raw: RawCostProposal): CostProposal | null {
  const amount = num(raw.amount);
  if (amount === null || amount < 0) return null;

  const category: CostCategory =
    typeof raw.category === "string" && (COST_CATEGORIES as string[]).includes(raw.category)
      ? (raw.category as CostCategory)
      : "other";
  const maintenance_type: MaintenanceType =
    typeof raw.maintenance_type === "string" && (MAINTENANCE_TYPES as string[]).includes(raw.maintenance_type)
      ? (raw.maintenance_type as MaintenanceType)
      : "reactive";
  const currency = (str(raw.currency) ?? "USD").toUpperCase().slice(0, 3) || "USD";

  return {
    type: "cost",
    category,
    maintenance_type,
    amount,
    currency,
    asset_id: str(raw.asset_id),
    description: str(raw.description),
  };
}

export interface RawEnergyProposal {
  kwh?: unknown;
  cost?: unknown;
  currency?: unknown;
  asset_id?: unknown;
  meter_label?: unknown;
}

/** Coerce a model-proposed energy reading. Returns null without a valid non-negative kWh. */
export function normalizeEnergyProposal(raw: RawEnergyProposal): EnergyProposal | null {
  const kwh = num(raw.kwh);
  if (kwh === null || kwh < 0) return null;
  const cost = num(raw.cost);
  const currency = (str(raw.currency) ?? "USD").toUpperCase().slice(0, 3) || "USD";

  return {
    type: "energy",
    kwh,
    cost: cost !== null && cost >= 0 ? cost : null,
    currency,
    asset_id: str(raw.asset_id),
    meter_label: str(raw.meter_label),
  };
}

/** Dispatch a raw proposal (carrying a `type`) to the right normalizer. */
export function normalizeProposal(raw: { type?: unknown } & Record<string, unknown>): AssistantProposal | null {
  switch (raw?.type) {
    case "work_order":
      return normalizeWorkOrderProposal(raw as RawWorkOrderProposal);
    case "cost":
      return normalizeCostProposal(raw as RawCostProposal);
    case "energy":
      return normalizeEnergyProposal(raw as RawEnergyProposal);
    default:
      return null;
  }
}
