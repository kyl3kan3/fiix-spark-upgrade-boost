import { describe, it, expect } from "vitest";
import { monthKey, lastNMonthKeys } from "@/lib/dateUtils";

describe("dateUtils.monthKey", () => {
  it("zero-pads the month", () => {
    expect(monthKey(new Date(2026, 2, 9))).toBe("2026-03"); // month index 2 = March
    expect(monthKey(new Date(2026, 11, 31))).toBe("2026-12");
  });
});

describe("dateUtils.lastNMonthKeys", () => {
  it("returns continuous oldest-first keys ending at the ref month", () => {
    expect(lastNMonthKeys(3, new Date(2026, 5, 15))).toEqual(["2026-04", "2026-05", "2026-06"]);
  });

  it("crosses the year boundary", () => {
    expect(lastNMonthKeys(3, new Date(2026, 1, 10))).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("returns a single key for n=1", () => {
    expect(lastNMonthKeys(1, new Date(2026, 0, 1))).toEqual(["2026-01"]);
  });
});
