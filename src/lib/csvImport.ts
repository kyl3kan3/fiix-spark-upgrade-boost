/**
 * Pure CSV-import helpers for the import hub: a quote-aware parser plus per-entity
 * row validators that turn raw records into typed insert payloads (with per-row
 * error reporting). No data-layer / React imports, so it's unit-testable.
 */

import { splitCsvLine } from "./csvParser";

export type ImportKind = "assets" | "work_orders";

export interface AssetImportRow {
  name: string;
  status?: string;
  location?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  description?: string;
}

export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";
export type WorkOrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface WorkOrderImportRow {
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  due_date?: string;
}

export interface ValidationResult<T> {
  rows: T[];
  errors: string[];
}

const WO_PRIORITIES: WorkOrderPriority[] = ["low", "medium", "high", "urgent"];
const WO_STATUSES: WorkOrderStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export const IMPORT_TEMPLATES: Record<ImportKind, string> = {
  assets: "name,status,location,model,serial_number,purchase_date,description",
  work_orders: "title,description,priority,status,due_date",
};

/** Parse CSV text into header-keyed records (keys lowercased). */
export function parseCsvRecords(text: string): { records: Record<string, string>[]; error: string | null } {
  const lines = (text ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    return { records: [], error: "CSV needs a header row and at least one data row." };
  }
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const rec: Record<string, string> = {};
    header.forEach((h, idx) => {
      rec[h] = cells[idx] ?? "";
    });
    records.push(rec);
  }
  return { records, error: null };
}

function toIsoOrNull(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function validateAssetRows(records: Record<string, string>[]): ValidationResult<AssetImportRow> {
  const rows: AssetImportRow[] = [];
  const errors: string[] = [];
  records.forEach((r, i) => {
    const line = i + 2; // +1 for header, +1 for 1-based
    const name = (r.name ?? "").trim();
    if (name.length < 2) {
      errors.push(`Row ${line}: missing or too-short name.`);
      return;
    }
    const purchase = (r.purchase_date ?? "").trim();
    if (purchase && !toIsoOrNull(purchase)) {
      errors.push(`Row ${line}: invalid purchase_date "${purchase}".`);
      return;
    }
    rows.push({
      name,
      status: (r.status ?? "").trim() || undefined,
      location: (r.location ?? "").trim() || undefined,
      model: (r.model ?? "").trim() || undefined,
      serial_number: (r.serial_number ?? "").trim() || undefined,
      purchase_date: toIsoOrNull(purchase),
      description: (r.description ?? "").trim() || undefined,
    });
  });
  return { rows, errors };
}

export function validateWorkOrderRows(
  records: Record<string, string>[],
): ValidationResult<WorkOrderImportRow> {
  const rows: WorkOrderImportRow[] = [];
  const errors: string[] = [];
  records.forEach((r, i) => {
    const line = i + 2;
    const title = (r.title ?? "").trim();
    if (title.length < 3) {
      errors.push(`Row ${line}: missing or too-short title.`);
      return;
    }
    let description = (r.description ?? "").trim();
    if (description.length < 5) description = `Imported: ${title}`;

    const rawPriority = (r.priority ?? "").trim().toLowerCase();
    const priority = (WO_PRIORITIES as string[]).includes(rawPriority)
      ? (rawPriority as WorkOrderPriority)
      : "medium";

    const rawStatus = (r.status ?? "").trim().toLowerCase();
    const status = (WO_STATUSES as string[]).includes(rawStatus)
      ? (rawStatus as WorkOrderStatus)
      : "pending";

    rows.push({ title, description, priority, status, due_date: toIsoOrNull((r.due_date ?? "").trim()) });
  });
  return { rows, errors };
}
