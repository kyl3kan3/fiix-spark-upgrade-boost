import type { PartUsageLog } from "@/types/parts";

export interface ConsumptionByKey {
  key: string;
  label: string;
  totalQuantity: number;
}

export function summarizeUsageByAsset(logs: PartUsageLog[]): ConsumptionByKey[] {
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

export function summarizeUsageByPart(logs: PartUsageLog[]): ConsumptionByKey[] {
  const map = new Map<string, { label: string; total: number }>();
  for (const log of logs) {
    const label = log.part?.name ?? log.part_id;
    const prev = map.get(log.part_id) ?? { label, total: 0 };
    prev.total += Number(log.quantity);
    map.set(log.part_id, prev);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, totalQuantity: v.total }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
}

export function isLowStock(quantityOnHand: number, minQuantity: number): boolean {
  return minQuantity > 0 && quantityOnHand <= minQuantity;
}
