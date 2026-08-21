import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PLAN_OFFERS_JSON_LD,
  PRODUCT_JSON_LD,
  PRODUCT_PLANS,
  PRODUCT_SUPPORT_SUMMARY,
  PRODUCT_TRIAL_SUMMARY,
  PRODUCT_TRIAL_DAYS,
  PRODUCT_BILLING_SUMMARY,
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
    expect(PRODUCT_JSON_LD).not.toHaveProperty("aggregateRating");
    expect(PRODUCT_JSON_LD).not.toHaveProperty("review");
    expect(PRODUCT_JSON_LD.offers).toHaveLength(PRODUCT_PLANS.length * 2);
  });

  it("keeps trial and support policy tied to the published catalog", () => {
    expect(PRODUCT_TRIAL_SUMMARY).toContain("7-day free trial");
    expect(PRODUCT_TRIAL_DAYS).toBe(7);
    expect(PRODUCT_TRIAL_SUMMARY).toContain("before day 8");
    expect(PRODUCT_SUPPORT_SUMMARY).toContain("Business includes email and chat support");
    expect(PRODUCT_BILLING_SUMMARY).toContain("Starter, Pro, and Business");
    expect(PRODUCT_PLANS.map((plan) => plan.name)).toEqual(["Starter", "Pro", "Business"]);
  });

  it("keeps generated agent and llms pricing facts synchronized", () => {
    const agentCatalog = JSON.parse(readFileSync(resolve("public/api/ai.json"), "utf8"));
    expect(agentCatalog.pricing.plans).toEqual(PRODUCT_PLANS.map((plan) => ({
      name: plan.name,
      monthly_price: plan.monthlyPrice,
      annual_price: plan.annualPrice,
      included_seats: plan.includedSeats,
      additional_seat_monthly_price: plan.extraSeatMonthlyPrice,
      asset_limit: plan.assetLimit,
      monthly_work_order_limit: plan.monthlyWorkOrderLimit,
    })));
    expect(agentCatalog.pricing.trial_days).toBe(PRODUCT_TRIAL_DAYS);
    expect(agentCatalog.pricing.support_summary).toBe(PRODUCT_SUPPORT_SUMMARY);
    expect(agentCatalog.comparisons.find((entry: { competitor: string }) => entry.competitor === "eMaint")?.competitor_price_per_user_usd).toBeNull();

    const llms = readFileSync(resolve("public/llms.txt"), "utf8");
    expect(llms).toContain(PRODUCT_TRIAL_SUMMARY);
    expect(llms).toContain(PRODUCT_SUPPORT_SUMMARY);

    const webMcp = readFileSync(resolve("src/lib/webmcp.ts"), "utf8");
    expect(webMcp).toContain("PRODUCT_TRIAL_SUMMARY");
    expect(webMcp).toContain("PRODUCT_SUPPORT_SUMMARY");
    expect(webMcp).not.toMatch(/\$49|\$129|\$299|7-day free trial/);
  });
});
