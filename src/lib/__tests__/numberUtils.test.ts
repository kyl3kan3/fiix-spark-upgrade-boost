import { describe, it, expect } from "vitest";
import { round } from "@/lib/numberUtils";

describe("numberUtils.round", () => {
  it("defaults to 2 decimal places", () => {
    expect(round(1.2345)).toBe(1.23);
    expect(round(1.005)).toBe(1.01); // epsilon-corrected, not 1.00
  });

  it("respects a custom precision", () => {
    expect(round(1.23456, 4)).toBe(1.2346);
    expect(round(1.6, 0)).toBe(2);
  });

  it("handles negatives and zero", () => {
    expect(round(-1.005, 2)).toBe(-1); // matches Math.round half-up toward +∞
    expect(round(0)).toBe(0);
  });
});
