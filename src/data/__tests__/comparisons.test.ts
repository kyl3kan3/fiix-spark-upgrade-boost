import { describe, it, expect } from "vitest";
import {
  comparisons,
  getComparison,
  getFaqSchemaEntries,
  MAINTENEASE_TEAM_PRICE,
  TEAM_SIZE,
} from "@/data/comparisons";

describe("comparisons data", () => {
  it("has unique, well-formed slugs", () => {
    const slugs = comparisons.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^maintenease-vs-[a-z]+$/);
  });

  it("getComparison resolves known slugs and rejects unknown", () => {
    expect(getComparison("maintenease-vs-upkeep")?.competitor).toBe("UpKeep");
    expect(getComparison("nope")).toBeUndefined();
  });

  it("every comparison carries pricing context, rows, differentiators and faqs", () => {
    for (const c of comparisons) {
      if (c.competitorPricePerUser !== null) {
        expect(c.competitorPricePerUser).toBeGreaterThan(0);
      } else {
        expect(c.pricingTable?.rows.every((row) => row.competitorPrice.includes("Custom"))).toBe(true);
      }
      expect(c.rows.length).toBeGreaterThan(0);
      expect(c.differentiators.length).toBeGreaterThan(0);
      expect(c.faqs.length).toBeGreaterThan(0);
      expect(c.metaTitle).toMatch(/MaintenEase/);
    }
  });

  it("uses the real MaintenEase team price even when a competitor is cheaper", () => {
    for (const c of comparisons) {
      const pricingRow = c.rows.find((row) => row.feature === `Cost for a team of ${TEAM_SIZE}`);
      expect(pricingRow?.ours).toBe(`$${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo (${MAINTENEASE_TEAM_PRICE.plan.name})`);
      expect(pricingRow?.theirs).toBe(
        c.competitorPricePerUser === null
          ? "Quote required"
          : `$${c.competitorPricePerUser * TEAM_SIZE}/mo`,
      );
    }
  });

  it("uses the target pricing phrases and official-source tables", () => {
    expect(getComparison("maintenease-vs-upkeep")?.pricingTable?.heading).toBe("UpKeep pricing in 2026");
    expect(getComparison("maintenease-vs-maintainx")?.pricingTable?.heading).toBe("MaintainX cost in 2026");
    expect(getComparison("maintenease-vs-limble")?.pricingTable?.heading).toBe("Limble pricing in 2026");
    for (const slug of ["maintenease-vs-upkeep", "maintenease-vs-maintainx", "maintenease-vs-limble", "maintenease-vs-fiix", "maintenease-vs-emaint"]) {
      expect(getComparison(slug)?.pricingTable?.sourceUrl).toMatch(/^https:\/\//);
      expect(getComparison(slug)?.pricingTable?.rows.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("does not reuse unsupported eMaint pricing or immutable-seat claims", () => {
    const emaint = getComparison("maintenease-vs-emaint");
    expect(emaint?.competitorPricePerUser).toBeNull();
    expect(emaint?.competitorPlan).toBe("Professional / Enterprise");
    expect(JSON.stringify(emaint)).not.toMatch(/\$69|"competitorPlan":"Team"|legacy enterprise|heavier interface|days, not months/i);

    const maintainx = getComparison("maintenease-vs-maintainx");
    expect(JSON.stringify(maintainx)).not.toContain("bill that never changes when you hire");
    expect(JSON.stringify(maintainx)).toContain("$15 monthly rate");
  });

  it("uses the six visible page-specific MaintainX FAQs verbatim in schema", () => {
    const comparison = getComparison("maintenease-vs-maintainx");
    expect(comparison).toBeDefined();

    const schemaFaqs = getFaqSchemaEntries(comparison!);
    expect(schemaFaqs).toHaveLength(6);
    expect(schemaFaqs).toEqual(comparison!.faqs.slice(0, 6));
  });
});
