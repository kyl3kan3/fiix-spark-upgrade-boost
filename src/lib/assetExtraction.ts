/**
 * Pure helpers for AI document → asset extraction. Normalizes the model's
 * proposed asset rows into the same shape the CSV importer uses, with
 * de-duplication and validation. No data-layer / React imports.
 */

import type { AssetImportRow } from "@/lib/csvImport";

export interface RawAssetProposal {
  name?: unknown;
  status?: unknown;
  location?: unknown;
  model?: unknown;
  serial_number?: unknown;
  description?: unknown;
}

function str(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t === "" ? undefined : t;
}

/**
 * Turn raw model proposals into valid, de-duplicated AssetImportRows. Rows
 * without a usable name (≥ 2 chars) are dropped; duplicates by case-insensitive
 * name are collapsed (first wins).
 */
export function normalizeAssetProposals(raw: RawAssetProposal[]): AssetImportRow[] {
  const seen = new Set<string>();
  const rows: AssetImportRow[] = [];
  for (const p of raw ?? []) {
    const name = str(p?.name);
    if (!name || name.length < 2) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      name,
      status: str(p?.status),
      location: str(p?.location),
      model: str(p?.model),
      serial_number: str(p?.serial_number),
      description: str(p?.description),
    });
  }
  return rows;
}
