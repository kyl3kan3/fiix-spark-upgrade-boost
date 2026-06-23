import { describe, it, expect } from "vitest";
import { normalizeIngestReadings, MAX_INGEST_ROWS } from "@/lib/energyIngest";

describe("energyIngest.normalizeIngestReadings", () => {
  it("accepts an array of readings", () => {
    const { rows, errors } = normalizeIngestReadings([
      { kwh: 100, cost: 20, meter_label: "Main", reading_date: "2026-06-01T00:00:00Z" },
      { kwh: "50" },
    ]);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ kwh: 100, cost: 20, currency: "USD", meter_label: "Main" });
    expect(rows[1].kwh).toBe(50);
    expect(rows[1].cost).toBeNull();
  });

  it("accepts a { readings: [...] } envelope and a single object", () => {
    expect(normalizeIngestReadings({ readings: [{ kwh: 5 }] }).rows).toHaveLength(1);
    expect(normalizeIngestReadings({ kwh: 9 }).rows).toHaveLength(1);
  });

  it("reports invalid/negative kwh per row but keeps valid ones", () => {
    const { rows, errors } = normalizeIngestReadings([{ kwh: -1 }, { kwh: "abc" }, { kwh: 12 }]);
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });

  it("defaults a missing/invalid date to now and uppercases currency", () => {
    const before = Date.now();
    const { rows } = normalizeIngestReadings([{ kwh: 1, currency: "eur", reading_date: "nope" }]);
    expect(rows[0].currency).toBe("EUR");
    expect(new Date(rows[0].reading_date).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("rejects empty and oversized batches", () => {
    expect(normalizeIngestReadings([]).errors[0]).toMatch(/no readings/i);
    const big = Array.from({ length: MAX_INGEST_ROWS + 1 }, () => ({ kwh: 1 }));
    expect(normalizeIngestReadings(big).errors[0]).toMatch(/too many/i);
  });
});
