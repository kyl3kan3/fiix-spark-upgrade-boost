import { describe, it, expect } from "vitest";
import { comparisons, getComparison, MAINTENEASE_PRO, TEAM_SIZE } from "@/data/comparisons";

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

  it("every comparison carries pricing, rows, differentiators and faqs", () => {
    for (const c of comparisons) {
      expect(c.competitorPricePerUser).toBeGreaterThan(0);
      expect(c.rows.length).toBeGreaterThan(0);
      expect(c.differentiators.length).toBeGreaterThan(0);
      expect(c.faqs.length).toBeGreaterThan(0);
      expect(c.metaTitle).toMatch(/MaintenEase/);
    }
  });

  it("MaintenEase is cheaper than each competitor for the reference team", () => {
    for (const c of comparisons) {
      expect(c.competitorPricePerUser * TEAM_SIZE).toBeGreaterThan(MAINTENEASE_PRO);
    }
  });
});
