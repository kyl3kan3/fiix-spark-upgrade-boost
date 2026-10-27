import { describe, expect, it } from "vitest";
import { isLowStock, summarizeUsageByPart } from "@/lib/partsAnalytics";
import type { PartUsageLog } from "@/types/parts";

describe("partsAnalytics", () => {
  it("aggregates usage by part", () => {
    const logs: PartUsageLog[] = [
      {
        id: "1",
        part_id: "p1",
        asset_id: null,
        work_order_id: "wo1",
        quantity: 2,
        used_at: "2026-01-01",
        used_by: null,
        notes: null,
        part: { name: "Filter", unit_of_measure: "ea" },
      },
      {
        id: "2",
        part_id: "p1",
        asset_id: null,
        work_order_id: "wo2",
        quantity: 3,
        used_at: "2026-01-02",
        used_by: null,
        notes: null,
        part: { name: "Filter", unit_of_measure: "ea" },
      },
    ];
    expect(summarizeUsageByPart(logs)[0].totalQuantity).toBe(5);
  });

  it("flags low stock at min quantity", () => {
    expect(isLowStock(2, 5)).toBe(true);
    expect(isLowStock(6, 5)).toBe(false);
  });
});
