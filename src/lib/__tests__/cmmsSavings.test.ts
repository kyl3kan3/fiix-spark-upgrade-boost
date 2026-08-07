import { describe, it, expect } from "vitest";
import {
  clampTeamSize,
  breakevenTeamSize,
  computeCmmsCosts,
  formatUsd,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
  DEFAULT_TEAM_SIZE,
} from "@/lib/cmmsSavings";
import { comparisons } from "@/data/comparisons";
import { getMaintenEaseTeamPrice } from "@/data/productCatalog";

describe("cmmsSavings", () => {
  it("clamps team size to bounds and rounds; falls back on nonsense", () => {
    expect(clampTeamSize(0)).toBe(MIN_TEAM_SIZE);
    expect(clampTeamSize(999)).toBe(MAX_TEAM_SIZE);
    expect(clampTeamSize(7.6)).toBe(8);
    expect(clampTeamSize(NaN)).toBe(DEFAULT_TEAM_SIZE);
  });

  it("breakeven is the smallest team size where the applicable account plan beats per-user", () => {
    for (const c of comparisons) {
      const n = breakevenTeamSize(c.competitorPricePerUser);
      expect(n).toBeLessThanOrEqual(MAX_TEAM_SIZE + 1);
      if (n <= MAX_TEAM_SIZE) {
        expect(n * c.competitorPricePerUser).toBeGreaterThan(getMaintenEaseTeamPrice(n).monthlyPrice);
        for (let teamSize = MIN_TEAM_SIZE; teamSize < n; teamSize += 1) {
          expect(teamSize * c.competitorPricePerUser).toBeLessThanOrEqual(
            getMaintenEaseTeamPrice(teamSize).monthlyPrice,
          );
        }
      }
    }
  });

  it("computes one row per competitor, most expensive first", () => {
    const r = computeCmmsCosts(8);
    expect(r.vendors).toHaveLength(comparisons.length);
    const monthlies = r.vendors.map((v) => v.monthly);
    expect([...monthlies].sort((a, b) => b - a)).toEqual(monthlies);
    expect(r.maxMonthly).toBe(Math.max(r.maintenease, ...monthlies));
  });

  it("is honest at small team sizes: cheaper rivals show negative savings", () => {
    const r = computeCmmsCosts(2);
    const maintainx = r.vendors.find((v) => v.name === "MaintainX");
    expect(maintainx).toBeDefined();
    expect(maintainx!.monthlySavings).toBeLessThan(0);
    expect(r.beatsAllVendors).toBe(false);
    expect(r.bestAnnualSavings).toBeGreaterThanOrEqual(0);
  });

  it("beats every rival at larger team sizes", () => {
    const worstBreakeven = Math.max(
      ...comparisons.map((c) => breakevenTeamSize(c.competitorPricePerUser)),
    );
    const r = computeCmmsCosts(worstBreakeven);
    expect(r.beatsAllVendors).toBe(true);
    expect(r.bestAnnualSavings).toBeGreaterThan(0);
  });

  it("formats whole USD amounts", () => {
    expect(formatUsd(1234.4)).toBe("$1,234");
    expect(formatUsd(-39)).toBe("$39");
  });
});
