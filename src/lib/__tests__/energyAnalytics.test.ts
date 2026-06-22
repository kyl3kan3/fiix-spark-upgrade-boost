import { describe, it, expect } from "vitest";
import {
  summarizeEnergy,
  parseEnergyCsv,
  formatKwh,
  type EnergyRecord,
} from "@/lib/energyAnalytics";

const REF = new Date("2026-06-15T12:00:00Z");

function rec(p: Partial<EnergyRecord>): EnergyRecord {
  return { kwh: 100, cost: null, reading_date: "2026-06-01T00:00:00Z", asset_id: null, meter_label: null, ...p };
}

describe("energyAnalytics.summarizeEnergy", () => {
  it("zeroes out for no records", () => {
    const s = summarizeEnergy([], { ref: REF });
    expect(s.totalKwh).toBe(0);
    expect(s.totalCost).toBe(0);
    expect(s.avgCostPerKwh).toBe(0);
    expect(s.monthly).toHaveLength(6);
    expect(s.topConsumers).toEqual([]);
  });

  it("totals kWh and cost and buckets by trailing month", () => {
    const s = summarizeEnergy(
      [
        rec({ kwh: 100, cost: 20, reading_date: "2026-06-10T00:00:00Z" }),
        rec({ kwh: 50, cost: 10, reading_date: "2026-05-02T00:00:00Z" }),
      ],
      { ref: REF },
    );
    expect(s.totalKwh).toBe(150);
    expect(s.totalCost).toBe(30);
    expect(s.monthly.find((m) => m.month === "2026-06")?.kwh).toBe(100);
    expect(s.monthly.find((m) => m.month === "2026-05")?.cost).toBe(10);
  });

  it("computes blended $/kWh only over rows that reported a cost", () => {
    const s = summarizeEnergy(
      [
        rec({ kwh: 100, cost: 25 }), // costed
        rec({ kwh: 900, cost: null }), // no cost -> excluded from denominator
      ],
      { ref: REF },
    );
    expect(s.avgCostPerKwh).toBe(0.25);
  });

  it("ranks top consumers by asset then meter label", () => {
    const s = summarizeEnergy(
      [
        rec({ kwh: 100, asset_id: "a" }),
        rec({ kwh: 400, asset_id: "b" }),
        rec({ kwh: 50, asset_id: "a" }),
        rec({ kwh: 70, meter_label: "Main meter" }),
      ],
      { ref: REF, topConsumersLimit: 2 },
    );
    expect(s.topConsumers.map((c) => c.key)).toEqual(["asset:b", "asset:a"]);
  });
});

describe("energyAnalytics.parseEnergyCsv", () => {
  it("parses date/kwh/cost/meter columns in any order", () => {
    const csv = ["meter,date,kwh,cost", "Main,2026-06-01,120,24.5", "Pump,2026-06-02,30,"].join("\n");
    const { rows, errors } = parseEnergyCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0].kwh).toBe(120);
    expect(rows[0].cost).toBe(24.5);
    expect(rows[0].meter_label).toBe("Main");
    expect(rows[1].cost).toBeNull();
  });

  it("reports rows with invalid date or kwh and keeps the good ones", () => {
    const csv = ["date,kwh", "not-a-date,10", "2026-06-01,abc", "2026-06-02,55"].join("\n");
    const { rows, errors } = parseEnergyCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].kwh).toBe(55);
    expect(errors).toHaveLength(2);
  });

  it("requires date and kwh columns", () => {
    const { rows, errors } = parseEnergyCsv("foo,bar\n1,2");
    expect(rows).toEqual([]);
    expect(errors[0]).toMatch(/date.*kwh/i);
  });

  it("handles quoted fields containing commas", () => {
    const csv = ['date,kwh,meter', '2026-06-01,12,"Plant A, North"'].join("\n");
    const { rows } = parseEnergyCsv(csv);
    expect(rows[0].meter_label).toBe("Plant A, North");
  });
});

describe("energyAnalytics.formatKwh", () => {
  it("formats whole kWh without decimals", () => {
    expect(formatKwh(1500)).toMatch(/1,?500 kWh/);
  });
});
