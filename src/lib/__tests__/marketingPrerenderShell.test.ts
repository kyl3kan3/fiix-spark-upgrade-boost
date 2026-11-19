import { describe, expect, it } from "vitest";
import {
  assertCompareHeroParity,
  assertSolutionHeroParity,
  buildCompareMarketingPrerenderShell,
  buildSolutionMarketingPrerenderShell,
  marketingDetailHeroVariant,
  SOLUTION_PAGE_INTRO_CLASS,
  SOLUTION_MARKETING_HERO_GEOMETRY,
} from "@/lib/marketingPrerenderShell";

describe("marketing prerender shell", () => {
  const g = SOLUTION_MARKETING_HERO_GEOMETRY;

  it("maps detail paths to hero variants", () => {
    expect(marketingDetailHeroVariant("/solutions/work-order-software")).toBe("solution");
    expect(marketingDetailHeroVariant("/compare/maintenease-vs-maintainx")).toBe("compare");
    expect(marketingDetailHeroVariant("/solutions")).toBeNull();
    expect(marketingDetailHeroVariant("/learn/cmms")).toBeNull();
  });

  it("matches SolutionPage hero geometry tokens", () => {
    expect(g.containerMaxWidthRem).toBe(64);
    expect(g.h1.baseLineHeightRem).toBe(2.5);
    expect(g.intro.lineHeight).toBe(1.625);
  });

  it("solution shell includes breadcrumb, h1, intro, and CTA markers", () => {
    const shell = buildSolutionMarketingPrerenderShell({
      breadcrumbCurrent: "Work Order Software",
      heroH1: "Close Work Orders Faster",
      heroIntro: "Intro copy",
      bodyHtml: "<h2>Next</h2>",
    });
    expect(() => assertSolutionHeroParity(shell)).not.toThrow();
  });

  it("compare shell matches ComparePage hero (no intro paragraph)", () => {
    const shell = buildCompareMarketingPrerenderShell({
      breadcrumbCurrent: "MaintenEase vs MaintainX",
      heroH1: "MaintenEase vs MaintainX",
      bodyHtml: "<h2>Pricing</h2>",
      pricingTable: {
        heading: "MaintainX cost in 2026",
        summary: "MaintainX lists a free Basic plan.",
      },
    });
    expect(() => assertCompareHeroParity(shell)).not.toThrow();
    const heroInner =
      shell.match(/prerender-marketing-hero-inner">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
    expect(heroInner).not.toContain(SOLUTION_PAGE_INTRO_CLASS);
    expect(heroInner).not.toMatch(/<p class=/);
    expect(shell).toContain("MaintainX lists a free Basic plan.");
    expect(shell).toContain("text-pretty");
  });
});