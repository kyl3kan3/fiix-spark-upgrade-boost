import { describe, it, expect } from "vitest";
import {
  summarizeCosts,
  lastNMonthKeys,
  monthKey,
  formatCurrency,
  type CostRecord,
} from "@/lib/costAnalytics";

const REF = new Date("2026-06-15T12:00:00Z");

function rec(partial: Partial<CostRecord>): CostRecord {
  return {
    amount: 100,
    category: "parts",
    maintenance_type: "reactive",
    incurred_at: "2026-06-01T00:00:00Z",
    asset_id: null,
    ...partial,
  };
}

describe("costAnalytics.summarizeCosts", () => {
  it("returns a zeroed summary for no records", () => {
    const s = summarizeCosts([], { ref: REF });
    expect(s.total).toBe(0);
    expect(s.count).toBe(0);
    expect(s.preventiveRatio).toBe(0);
    expect(s.topAssets).toEqual([]);
    expect(s.monthly).toHaveLength(6);
    expect(s.monthly.every((m) => m.total === 0)).toBe(true);
  });

  it("totals amounts and splits by category and type", () => {
    const s = summarizeCosts(
      [
        rec({ amount: 200, category: "labor", maintenance_type: "preventive" }),
        rec({ amount: 50, category: "parts", maintenance_type: "reactive" }),
        rec({ amount: 25, category: "parts", maintenance_type: "reactive" }),
      ],
      { ref: REF },
    );
    expect(s.total).toBe(275);
    expect(s.count).toBe(3);
    expect(s.byCategory.labor).toBe(200);
    expect(s.byCategory.parts).toBe(75);
    expect(s.byCategory.contractor).toBe(0);
    expect(s.byType.preventive).toBe(200);
    expect(s.byType.reactive).toBe(75);
  });

  it("computes preventive ratio over preventive + reactive only (ignores 'other')", () => {
    const s = summarizeCosts(
      [
        rec({ amount: 75, maintenance_type: "preventive" }),
        rec({ amount: 25, maintenance_type: "reactive" }),
        rec({ amount: 1000, maintenance_type: "other" }),
      ],
      { ref: REF },
    );
    expect(s.preventiveRatio).toBe(0.75);
  });

  it("buckets spend into the trailing N months and fills gaps with zero", () => {
    const s = summarizeCosts(
      [
        rec({ amount: 100, incurred_at: "2026-06-10T00:00:00Z" }),
        rec({ amount: 40, incurred_at: "2026-04-02T00:00:00Z" }),
      ],
      { months: 6, ref: REF },
    );
    expect(s.monthly.map((m) => m.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
    expect(s.monthly.find((m) => m.month === "2026-06")?.total).toBe(100);
    expect(s.monthly.find((m) => m.month === "2026-04")?.total).toBe(40);
    expect(s.monthly.find((m) => m.month === "2026-05")?.total).toBe(0);
  });

  it("ranks top assets by spend and skips unassigned costs", () => {
    const s = summarizeCosts(
      [
        rec({ amount: 100, asset_id: "a" }),
        rec({ amount: 300, asset_id: "b" }),
        rec({ amount: 50, asset_id: "a" }),
        rec({ amount: 999, asset_id: null }),
      ],
      { ref: REF, topAssetsLimit: 2 },
    );
    expect(s.topAssets).toEqual([
      { assetId: "b", total: 300 },
      { assetId: "a", total: 150 },
    ]);
  });
});

describe("costAnalytics helpers", () => {
  it("monthKey pads the month", () => {
    expect(monthKey(new Date("2026-03-09T00:00:00Z"))).toBe("2026-03");
  });

  it("lastNMonthKeys returns continuous oldest-first keys", () => {
    expect(lastNMonthKeys(3, REF)).toEqual(["2026-04", "2026-05", "2026-06"]);
  });

  it("formatCurrency renders whole amounts without cents", () => {
    const out = formatCurrency(250, "USD");
    expect(out).toMatch(/250/);
    expect(out).not.toMatch(/250[.,]00/);
  });
});
