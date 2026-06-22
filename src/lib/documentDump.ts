/**
 * Pure helpers for the onboarding document-dump feature. No data-layer / React
 * imports, so they're unit-testable in isolation.
 */

export type DocKind = "asset_list" | "manual" | "warranty" | "floor_plan" | "invoice" | "other";

export const DOC_KINDS: DocKind[] = ["asset_list", "manual", "warranty", "floor_plan", "invoice", "other"];

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  asset_list: "Asset list",
  manual: "Manual",
  warranty: "Warranty",
  floor_plan: "Floor plan",
  invoice: "Invoice",
  other: "Other",
};

/** Accepted upload types — spreadsheets, docs, PDFs, images, text. */
export const ACCEPTED_MIME_HINT =
  ".pdf,.csv,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB per file

/** Collapse a filename to a storage-safe slug while preserving its extension. */
export function sanitizeFileName(name: string): string {
  const trimmed = (name ?? "").trim();
  const dot = trimmed.lastIndexOf(".");
  const hasExt = dot > 0 && dot < trimmed.length - 1;
  const base = hasExt ? trimmed.slice(0, dot) : trimmed;
  const ext = hasExt ? trimmed.slice(dot + 1) : "";

  const cleanBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file";
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
}

/**
 * Build the storage object path: `{companyId}/{uuid}-{sanitized}`. The company id
 * as the first segment is what the storage RLS policy checks.
 */
export function buildStoragePath(companyId: string, fileName: string, uuid: string): string {
  return `${companyId}/${uuid}-${sanitizeFileName(fileName)}`;
}

/** Best-effort document-kind guess from a filename, for a sensible default. */
export function inferDocKind(fileName: string): DocKind {
  const n = (fileName ?? "").toLowerCase();
  if (/\.(csv|xlsx?|)$/.test(n) && /(asset|equipment|inventory|list)/.test(n)) return "asset_list";
  if (/(manual|guide|handbook|spec)/.test(n)) return "manual";
  if (/(warrant)/.test(n)) return "warranty";
  if (/(floor.?plan|blueprint|drawing|layout)/.test(n)) return "floor_plan";
  if (/(invoice|receipt|bill)/.test(n)) return "invoice";
  return "other";
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}
