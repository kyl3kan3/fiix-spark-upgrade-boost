import { describe, expect, it } from "vitest";
import { comparisons } from "@/data/comparisons";
import { getMaintenEaseTeamPrice } from "@/data/productCatalog";
import {
  COMPETITOR_OPTIONS,
  SMALL_BUSINESS_CMMS_OPTIONS,
  SMALL_BUSINESS_TEAM_SIZES,
  TEAM_COST_ROWS,
} from "@/data/smallBusinessCmms";

describe("small business CMMS roundup data", () => {
  it("lists MaintenEase plus every published comparison", () => {
    expect(COMPETITOR_OPTIONS.map((option) => option.name).sort()).toEqual(
      comparisons.map((comparison) => comparison.competitor).sort(),
    );
    expect(SMALL_BUSINESS_CMMS_OPTIONS[0].name).toBe("MaintenEase");
  });

  it("takes every competitor price and source from the comparison data", () => {
    for (const option of COMPETITOR_OPTIONS) {
      const comparison = comparisons.find((candidate) => candidate.competitor === option.name);
      expect(option.pricePerUser).toBe(comparison?.competitorPricePerUser);
      expect(option.sourceUrl).toBe(comparison?.pricingTable?.sourceUrl);
      expect(option.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("never invents a cost for quote-only vendors and shows per-user math for the rest", () => {
    for (const row of TEAM_COST_ROWS.slice(1)) {
      const option = COMPETITOR_OPTIONS.find((candidate) => candidate.name === row.name);
      row.costs.forEach((cost, index) => {
        expect(cost).toBe(option?.pricePerUser == null ? null : option.pricePerUser * SMALL_BUSINESS_TEAM_SIZES[index]);
      });
    }
    expect(TEAM_COST_ROWS[0].costs).toEqual(SMALL_BUSINESS_TEAM_SIZES.map((size) => getMaintenEaseTeamPrice(size).monthlyPrice));
  });
});
