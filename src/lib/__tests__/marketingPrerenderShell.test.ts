import postcss from "postcss";
import type { Rule } from "postcss";
import { describe, expect, it } from "vitest";
import {
  SOLUTION_MARKETING_HERO_CRITICAL_CSS,
  SOLUTION_MARKETING_HERO_GEOMETRY,
  assertCompareHeroParity,
  assertSolutionHeroParity,
  buildCompareMarketingPrerenderShell,
  buildSolutionMarketingPrerenderShell,
  marketingDetailHeroVariant,
} from "@/lib/marketingPrerenderShell";

function assertBalancedCssBraces(css: string): void {
  let depth = 0;
  let inString: '"' | "'" | null = null;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      expect(depth, `unbalanced '}' near index ${i}`).toBeGreaterThanOrEqual(0);
    }
  }

  expect(depth, "critical CSS has unclosed '{'").toBe(0);
}

describe("marketing prerender shell", () => {
  const g = SOLUTION_MARKETING_HERO_GEOMETRY;

  it("maps detail paths to hero variants", () => {
    expect(marketingDetailHeroVariant("/solutions/work-order-software")).toBe("solution");
    expect(marketingDetailHeroVariant("/compare/maintenease-vs-maintainx")).toBe("compare");
    expect(marketingDetailHeroVariant("/solutions")).toBeNull();
    expect(marketingDetailHeroVariant("/learn/cmms")).toBeNull();
  });

  it("parses solution marketing critical CSS with postcss", () => {
    expect(() => postcss.parse(SOLUTION_MARKETING_HERO_CRITICAL_CSS)).not.toThrow();
    assertBalancedCssBraces(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
  });

  it("keeps body selector as a top-level rule", () => {
    const root = postcss.parse(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
    const topLevelSelectors = root.nodes
      .filter((node): node is Rule => node.type === "rule")
      .map((rule) => rule.selector);

    expect(topLevelSelectors).toContain(".prerender-body");
  });

  it("matches SolutionPage hero geometry tokens", () => {
    expect(g.containerMaxWidthRem).toBe(64);
    expect(g.h1.baseLineHeightRem).toBe(2.5);
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain("line-height:2.5rem");
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
    });
    expect(() => assertCompareHeroParity(shell)).not.toThrow();
    expect(shell).not.toMatch(/prerender-marketing-hero-inner[\s\S]*<p class=/);
  });
});