import { describe, expect, it } from "vitest";
import {
  PLAN_OFFERS_JSON_LD,
  PRODUCT_JSON_LD,
  PRODUCT_PLANS,
  SOFTWARE_APPLICATION_JSON_LD,
  getMaintenEaseTeamPrice,
} from "@/data/productCatalog";

describe("product catalog", () => {
  it("keeps monthly and annual offers synchronized with every visible plan", () => {
    expect(PLAN_OFFERS_JSON_LD).toHaveLength(PRODUCT_PLANS.length * 2);

    for (const plan of PRODUCT_PLANS) {
      const monthly = PLAN_OFFERS_JSON_LD.find((offer) => offer["@id"].endsWith(`#${plan.tier}-monthly`));
      const annual = PLAN_OFFERS_JSON_LD.find((offer) => offer["@id"].endsWith(`#${plan.tier}-annual`));

      expect(monthly?.price).toBe(String(plan.monthlyPrice));
      expect(monthly?.priceCurrency).toBe("USD");
      expect(monthly?.availability).toBe("https://schema.org/InStock");
      expect(monthly?.priceSpecification.billingDuration).toBe("P1M");
      expect(annual?.price).toBe(String(plan.annualPrice));
      expect(annual?.priceSpecification.billingDuration).toBe("P1Y");
    }
  });

  it("uses the correct account plan and Business extra-seat price", () => {
    expect(getMaintenEaseTeamPrice(1).monthlyPrice).toBe(49);
    expect(getMaintenEaseTeamPrice(2).monthlyPrice).toBe(49);
    expect(getMaintenEaseTeamPrice(3).monthlyPrice).toBe(129);
    expect(getMaintenEaseTeamPrice(4).monthlyPrice).toBe(129);
    expect(getMaintenEaseTeamPrice(5).monthlyPrice).toBe(314);
    expect(getMaintenEaseTeamPrice(8).monthlyPrice).toBe(359);
  });

  it("does not invent aggregate ratings or reviews", () => {
    for (const node of [PRODUCT_JSON_LD, SOFTWARE_APPLICATION_JSON_LD]) {
      expect(node).not.toHaveProperty("aggregateRating");
      expect(node).not.toHaveProperty("review");
    }
  });
});
