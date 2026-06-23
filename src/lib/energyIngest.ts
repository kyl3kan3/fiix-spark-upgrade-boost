/**
 * Pure validator for the live energy-ingest payload — the contract the public
 * `ingest-energy` edge function enforces. Kept here (and unit-tested) so the
 * accepted shape is documented and testable; the edge function mirrors it.
 */

export interface IngestReadingInput {
  kwh?: unknown;
  cost?: unknown;
  currency?: unknown;
  reading_date?: unknown;
  meter_label?: unknown;
}

export interface NormalizedReading {
  kwh: number;
  cost: number | null;
  currency: string;
  reading_date: string; // ISO
  meter_label: string | null;
}

export interface IngestResult {
  rows: NormalizedReading[];
  errors: string[];
}

export const MAX_INGEST_ROWS = 1000;

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * Validate a batch of incoming readings. Accepts either an array or a single
 * object under common keys; rows with an invalid/negative kWh are reported.
 */
export function normalizeIngestReadings(body: unknown): IngestResult {
  const errors: string[] = [];
  // deno-lint-ignore no-explicit-any
  const b = body as any;
  const list: unknown[] = Array.isArray(b)
    ? b
    : Array.isArray(b?.readings)
      ? b.readings
      : b && typeof b === "object"
        ? [b]
        : [];

  if (list.length === 0) return { rows: [], errors: ["No readings provided."] };
  if (list.length > MAX_INGEST_ROWS) {
    return { rows: [], errors: [`Too many readings (max ${MAX_INGEST_ROWS} per request).`] };
  }

  const rows: NormalizedReading[] = [];
  list.forEach((raw, i) => {
    const r = (raw ?? {}) as IngestReadingInput;
    const kwh = num(r.kwh);
    if (kwh === null || kwh < 0) {
      errors.push(`Reading ${i + 1}: invalid kwh.`);
      return;
    }
    const cost = num(r.cost);
    const rawDate = typeof r.reading_date === "string" ? r.reading_date : "";
    const parsed = rawDate ? new Date(rawDate) : new Date();
    const reading_date = Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    const currency =
      typeof r.currency === "string" && r.currency.trim() ? r.currency.trim().toUpperCase().slice(0, 3) : "USD";
    const meter_label =
      typeof r.meter_label === "string" && r.meter_label.trim() ? r.meter_label.trim() : null;

    rows.push({ kwh, cost: cost !== null && cost >= 0 ? cost : null, currency, reading_date, meter_label });
  });

  return { rows, errors };
}
