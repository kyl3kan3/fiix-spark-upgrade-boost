import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/formatting";

describe("formatting.formatCurrency", () => {
  it("omits decimals for whole amounts", () => {
    const out = formatCurrency(1000);
    expect(out).toMatch(/1.?000/); // thousands grouping is locale-dependent
    expect(out).not.toMatch(/000[.,]00/); // no cents on a whole amount
  });

  it("shows two decimals for fractional amounts", () => {
    expect(formatCurrency(1000.5)).toMatch(/000[.,]50/);
  });

  it("includes the amount for a non-default currency", () => {
    expect(formatCurrency(42, "EUR")).toMatch(/42/);
  });

  it("falls back to '<CUR> <amount>' for an invalid currency code", () => {
    expect(formatCurrency(12.5, "NOT_A_CURRENCY")).toBe("NOT_A_CURRENCY 12.50");
  });
});
