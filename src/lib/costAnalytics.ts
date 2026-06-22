/**
 * Pure cost-analytics helpers for the cost & savings dashboard. Kept free of any
 * data-layer / React imports so the aggregation is unit-testable in isolation.
 */

export type CostCategory = "labor" | "parts" | "contractor" | "downtime" | "other";
export type MaintenanceType = "preventive" | "reactive" | "other";

export const COST_CATEGORIES: CostCategory[] = ["labor", "parts", "contractor", "downtime", "other"];
export const MAINTENANCE_TYPES: MaintenanceType[] = ["preventive", "reactive", "other"];

/** Minimal shape the aggregation needs — `MaintenanceCost` rows satisfy it. */
export interface CostRecord {
  amount: number;
  category: CostCategory;
  maintenance_type: MaintenanceType;
  incurred_at: string;
  asset_id: string | null;
}

export interface MonthlyCost {
  month: string; // YYYY-MM
  total: number;
}

export interface AssetCost {
  assetId: string;
  total: number;
}

export interface CostSummary {
  total: number;
  count: number;
  byCategory: Record<CostCategory, number>;
  byType: Record<MaintenanceType, number>;
  /** preventive / (preventive + reactive); 0 when neither has been logged. */
  preventiveRatio: number;
  monthly: MonthlyCost[];
  topAssets: AssetCost[];
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Continuous YYYY-MM keys for the last `n` calendar months, oldest first. */
export function lastNMonthKeys(n: number, ref: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(monthKey(new Date(ref.getFullYear(), ref.getMonth() - i, 1)));
  }
  return keys;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface SummarizeOptions {
  months?: number;
  topAssetsLimit?: number;
  ref?: Date;
}

export function summarizeCosts(
  records: CostRecord[],
  { months = 6, topAssetsLimit = 5, ref = new Date() }: SummarizeOptions = {},
): CostSummary {
  const byCategory = Object.fromEntries(COST_CATEGORIES.map((c) => [c, 0])) as Record<CostCategory, number>;
  const byType = Object.fromEntries(MAINTENANCE_TYPES.map((t) => [t, 0])) as Record<MaintenanceType, number>;
  const monthTotals = new Map<string, number>();
  const assetTotals = new Map<string, number>();
  let total = 0;

  for (const r of records) {
    const amount = Number.isFinite(r.amount) ? r.amount : 0;
    total += amount;
    if (r.category in byCategory) byCategory[r.category] += amount;
    if (r.maintenance_type in byType) byType[r.maintenance_type] += amount;

    const mk = monthKey(new Date(r.incurred_at));
    monthTotals.set(mk, (monthTotals.get(mk) ?? 0) + amount);

    if (r.asset_id) assetTotals.set(r.asset_id, (assetTotals.get(r.asset_id) ?? 0) + amount);
  }

  const monthly = lastNMonthKeys(months, ref).map((month) => ({
    month,
    total: round2(monthTotals.get(month) ?? 0),
  }));

  const topAssets = [...assetTotals.entries()]
    .map(([assetId, t]) => ({ assetId, total: round2(t) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topAssetsLimit);

  const pvr = byType.preventive + byType.reactive;

  return {
    total: round2(total),
    count: records.length,
    byCategory: Object.fromEntries(
      COST_CATEGORIES.map((c) => [c, round2(byCategory[c])]),
    ) as Record<CostCategory, number>,
    byType: Object.fromEntries(
      MAINTENANCE_TYPES.map((t) => [t, round2(byType[t])]),
    ) as Record<MaintenanceType, number>,
    preventiveRatio: pvr > 0 ? round2(byType.preventive / pvr) : 0,
    monthly,
    topAssets,
  };
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
