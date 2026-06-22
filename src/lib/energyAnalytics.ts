/**
 * Pure energy-analytics + CSV-parsing helpers for the power-usage dashboard.
 * No data-layer / React imports, so they're unit-testable in isolation.
 */

export interface EnergyRecord {
  kwh: number;
  cost: number | null;
  reading_date: string;
  asset_id: string | null;
  meter_label: string | null;
}

export interface MonthlyEnergy {
  month: string; // YYYY-MM
  kwh: number;
  cost: number;
}

export interface ConsumerEnergy {
  /** asset_id, or `meter:<label>` for un-asset'd meters. */
  key: string;
  label: string;
  kwh: number;
}

export interface EnergySummary {
  totalKwh: number;
  totalCost: number;
  count: number;
  /** Blended $/kWh across rows that carried a cost; 0 when none did. */
  avgCostPerKwh: number;
  monthly: MonthlyEnergy[];
  topConsumers: ConsumerEnergy[];
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function lastNMonthKeys(n: number, ref: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(monthKey(new Date(ref.getFullYear(), ref.getMonth() - i, 1)));
  }
  return keys;
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export interface SummarizeEnergyOptions {
  months?: number;
  topConsumersLimit?: number;
  ref?: Date;
}

export function summarizeEnergy(
  records: EnergyRecord[],
  { months = 6, topConsumersLimit = 5, ref = new Date() }: SummarizeEnergyOptions = {},
): EnergySummary {
  const monthKwh = new Map<string, number>();
  const monthCost = new Map<string, number>();
  const consumerKwh = new Map<string, { label: string; kwh: number }>();
  let totalKwh = 0;
  let totalCost = 0;
  let costedKwh = 0; // kWh only from rows that reported a cost

  for (const r of records) {
    const kwh = Number.isFinite(r.kwh) ? r.kwh : 0;
    const cost = r.cost != null && Number.isFinite(r.cost) ? r.cost : 0;
    totalKwh += kwh;
    totalCost += cost;
    if (r.cost != null) costedKwh += kwh;

    const mk = monthKey(new Date(r.reading_date));
    monthKwh.set(mk, (monthKwh.get(mk) ?? 0) + kwh);
    monthCost.set(mk, (monthCost.get(mk) ?? 0) + cost);

    const key = r.asset_id ? `asset:${r.asset_id}` : r.meter_label ? `meter:${r.meter_label}` : "unassigned";
    const label = r.meter_label ?? (r.asset_id ? "" : "Unassigned");
    const prev = consumerKwh.get(key);
    consumerKwh.set(key, { label: prev?.label || label, kwh: (prev?.kwh ?? 0) + kwh });
  }

  const monthly = lastNMonthKeys(months, ref).map((month) => ({
    month,
    kwh: round(monthKwh.get(month) ?? 0),
    cost: round(monthCost.get(month) ?? 0),
  }));

  const topConsumers = [...consumerKwh.entries()]
    .map(([key, v]) => ({ key, label: v.label, kwh: round(v.kwh) }))
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, topConsumersLimit);

  return {
    totalKwh: round(totalKwh),
    totalCost: round(totalCost),
    count: records.length,
    avgCostPerKwh: costedKwh > 0 ? round(totalCost / costedKwh, 4) : 0,
    monthly,
    topConsumers,
  };
}

// ---------------------------------------------------------------------------
// CSV import
// ---------------------------------------------------------------------------

export interface ParsedEnergyRow {
  reading_date: string; // ISO
  kwh: number;
  cost: number | null;
  meter_label: string | null;
}

export interface CsvParseResult {
  rows: ParsedEnergyRow[];
  errors: string[];
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Parse an energy CSV. Expected header columns (case-insensitive, in any order):
 * `date`, `kwh`, optional `cost`, optional `meter`. Returns parsed rows plus a
 * per-line error list so the caller can surface what was skipped.
 */
export function parseEnergyCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = (text ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV needs a header row and at least one data row."] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const dateCol = idx("date");
  const kwhCol = idx("kwh");
  const costCol = idx("cost");
  const meterCol = idx("meter") !== -1 ? idx("meter") : idx("meter_label");

  if (dateCol === -1 || kwhCol === -1) {
    return { rows: [], errors: ["CSV must include 'date' and 'kwh' columns."] };
  }

  const rows: ParsedEnergyRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const rawDate = cells[dateCol] ?? "";
    const rawKwh = cells[kwhCol] ?? "";

    const parsedDate = new Date(rawDate);
    if (!rawDate || Number.isNaN(parsedDate.getTime())) {
      errors.push(`Row ${i + 1}: invalid date "${rawDate}".`);
      continue;
    }
    const kwh = Number(rawKwh);
    if (rawKwh === "" || !Number.isFinite(kwh) || kwh < 0) {
      errors.push(`Row ${i + 1}: invalid kWh "${rawKwh}".`);
      continue;
    }

    let cost: number | null = null;
    if (costCol !== -1 && (cells[costCol] ?? "") !== "") {
      const c = Number(cells[costCol]);
      if (Number.isFinite(c) && c >= 0) cost = c;
    }
    const meter = meterCol !== -1 ? cells[meterCol]?.trim() || null : null;

    rows.push({ reading_date: parsedDate.toISOString(), kwh, cost, meter_label: meter });
  }

  return { rows, errors };
}

export function formatKwh(kwh: number): string {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: kwh % 1 === 0 ? 0 : 1 }).format(kwh)} kWh`;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
