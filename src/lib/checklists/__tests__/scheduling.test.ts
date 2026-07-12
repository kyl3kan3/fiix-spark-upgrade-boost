import { describe, expect, it } from "vitest";
import { assetDueAt, dueAssetIds, isDue, nextDueAt } from "../scheduling";

describe("nextDueAt", () => {
  const wed10am = new Date("2025-01-15T10:00:00Z");

  it("returns null for one-time and unknown frequencies", () => {
    expect(nextDueAt("one-time", wed10am)).toBeNull();
    expect(nextDueAt("never", wed10am)).toBeNull();
  });

  it("schedules daily to the start of the next day", () => {
    const result = nextDueAt("daily", wed10am);
    expect(result?.getUTCDate()).toBe(16);
    expect(result?.getUTCHours()).toBe(0);
  });

  it("schedules twice daily at local UTC noon and midnight boundaries", () => {
    expect(nextDueAt("twice-daily", wed10am)?.toISOString())
      .toBe("2025-01-15T12:00:00.000Z");
    expect(nextDueAt("twice-daily", new Date("2025-01-15T18:00:00Z"))?.toISOString())
      .toBe("2025-01-16T00:00:00.000Z");
  });

  it("schedules weekly +7 days and biweekly +14 days", () => {
    expect(nextDueAt("weekly", wed10am)?.getUTCDate()).toBe(22);
    expect(nextDueAt("biweekly", wed10am)?.getUTCDate()).toBe(29);
  });

  it("schedules monthly, quarterly, annually with correct offsets", () => {
    expect(nextDueAt("monthly", wed10am)?.getUTCMonth()).toBe(1); // Feb
    expect(nextDueAt("quarterly", wed10am)?.getUTCMonth()).toBe(3); // Apr
    expect(nextDueAt("annually", wed10am)?.getUTCFullYear()).toBe(2026);
  });

  it("clamps month-end and leap-day recurrence like Postgres intervals", () => {
    const january31 = new Date("2025-01-31T10:00:00Z");
    const leapDay = new Date("2024-02-29T10:00:00Z");
    expect(nextDueAt("monthly", january31)?.toISOString())
      .toBe("2025-02-28T10:00:00.000Z");
    expect(nextDueAt("quarterly", january31)?.toISOString())
      .toBe("2025-04-30T10:00:00.000Z");
    expect(nextDueAt("annually", leapDay)?.toISOString())
      .toBe("2025-02-28T10:00:00.000Z");
  });
});

describe("isDue", () => {
  const now = new Date("2025-01-15T10:00:00Z");

  it("returns false for missing timestamps", () => {
    expect(isDue(null, now)).toBe(false);
    expect(isDue(undefined, now)).toBe(false);
  });

  it("returns true when next-due is in the past or equal to now", () => {
    expect(isDue("2025-01-15T09:59:59Z", now)).toBe(true);
    expect(isDue("2025-01-15T10:00:00Z", now)).toBe(true);
  });

  it("returns false when next-due is in the future", () => {
    expect(isDue("2025-01-15T10:00:01Z", now)).toBe(false);
  });
});

describe("assetDueAt", () => {
  it("returns null for missing or invalid base", () => {
    expect(assetDueAt(null)).toBeNull();
    expect(assetDueAt(undefined, 10)).toBeNull();
    expect(assetDueAt("not-a-date")).toBeNull();
  });

  it("adds the offset in minutes", () => {
    expect(assetDueAt("2025-01-15T10:00:00Z", 30)?.toISOString())
      .toBe("2025-01-15T10:30:00.000Z");
  });

  it("treats negative offsets as zero", () => {
    expect(assetDueAt("2025-01-15T10:00:00Z", -5)?.toISOString())
      .toBe("2025-01-15T10:00:00.000Z");
  });
});

describe("dueAssetIds", () => {
  const base = "2025-01-15T10:00:00Z";
  const now = new Date("2025-01-15T10:20:00Z");

  it("returns [] for a missing base", () => {
    expect(dueAssetIds(null, ["a", "b"], {}, now)).toEqual([]);
  });

  it("respects stagger offsets, filtering out assets whose window hasn't elapsed", () => {
    const offsets = { a: 0, b: 15, c: 30 };
    expect(dueAssetIds(base, ["a", "b", "c"], offsets, now)).toEqual(["a", "b"]);
  });

  it("defaults a missing offset to 0", () => {
    expect(dueAssetIds(base, ["a", "z"], { a: 30 }, now)).toEqual(["z"]);
  });
});
