import type { LubricantUsageLog } from "@/types/lubricants";

export interface ConsumptionByKey {
  key: string;
  label: string;
  totalQuantity: number;
}

export function summarizeUsageByLubricant(logs: LubricantUsageLog[]): ConsumptionByKey[] {
  const map = new Map<string, { label: string; total: number }>();
  for (const log of logs) {
    const label = log.lubricant?.name ?? log.lubricant_id;
    const prev = map.get(log.lubricant_id) ?? { label, total: 0 };
    prev.total += Number(log.quantity);
    map.set(log.lubricant_id, prev);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, totalQuantity: v.total }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
}

export function summarizeUsageByAsset(logs: LubricantUsageLog[]): ConsumptionByKey[] {
  const map = new Map<string, { label: string; total: number }>();
  for (const log of logs) {
    if (!log.asset_id) continue;
    const label = log.asset?.name ?? log.asset_id;
    const prev = map.get(log.asset_id) ?? { label, total: 0 };
    prev.total += Number(log.quantity);
    map.set(log.asset_id, prev);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, totalQuantity: v.total }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
}

export function isLowStock(quantityOnHand: number, reorderLevel: number): boolean {
  return reorderLevel > 0 && quantityOnHand <= reorderLevel;
}
