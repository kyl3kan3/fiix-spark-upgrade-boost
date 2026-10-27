import { describe, expect, it } from "vitest";
import { isLowStock, summarizeUsageByAsset, summarizeUsageByLubricant } from "@/lib/lubricantAnalytics";
import type { LubricantUsageLog } from "@/types/lubricants";

const sampleLogs: LubricantUsageLog[] = [
  {
    id: "1",
    lubricant_id: "l1",
    asset_id: "a1",
    checklist_id: null,
    checklist_submission_id: null,
    work_order_id: null,
    quantity: 2,
    used_at: "2026-01-01T00:00:00Z",
    used_by: null,
    notes: null,
    lubricant: { name: "ISO 68", unit_of_measure: "L" },
    asset: { name: "Pump A" },
  },
  {
    id: "2",
    lubricant_id: "l1",
    asset_id: "a2",
    checklist_id: null,
    checklist_submission_id: null,
    work_order_id: null,
    quantity: 3,
    used_at: "2026-01-02T00:00:00Z",
    used_by: null,
    notes: null,
    lubricant: { name: "ISO 68", unit_of_measure: "L" },
    asset: { name: "Pump B" },
  },
];

describe("lubricantAnalytics", () => {
  it("aggregates consumption by lubricant", () => {
    const rows = summarizeUsageByLubricant(sampleLogs);
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe("ISO 68");
    expect(rows[0].totalQuantity).toBe(5);
  });

  it("aggregates consumption by asset", () => {
    const rows = summarizeUsageByAsset(sampleLogs);
    expect(rows).toHaveLength(2);
    expect(rows[0].totalQuantity).toBe(3);
  });

  it("flags low stock when at or below reorder level", () => {
    expect(isLowStock(5, 10)).toBe(true);
    expect(isLowStock(10, 10)).toBe(true);
    expect(isLowStock(11, 10)).toBe(false);
    expect(isLowStock(0, 0)).toBe(false);
  });
});
