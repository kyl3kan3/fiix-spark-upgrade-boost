import postcss from "postcss";
import type { Rule } from "postcss";
import { describe, expect, it } from "vitest";
import {
  SOLUTION_MARKETING_HERO_CRITICAL_CSS,
  SOLUTION_MARKETING_HERO_GEOMETRY,
  SOLUTION_PAGE_HERO_H1_CLASS,
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

  it("maps solution and compare detail paths to the solution hero variant", () => {
    expect(marketingDetailHeroVariant("/solutions/work-order-software")).toBe("solution");
    expect(marketingDetailHeroVariant("/compare/maintenease-vs-upkeep")).toBe("solution");
    expect(marketingDetailHeroVariant("/solutions")).toBeNull();
    expect(marketingDetailHeroVariant("/learn/cmms")).toBeNull();
  });

  it("parses solution marketing critical CSS with postcss", () => {
    expect(() => postcss.parse(SOLUTION_MARKETING_HERO_CRITICAL_CSS)).not.toThrow();
    assertBalancedCssBraces(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
  });

  it("keeps intro styles as top-level rules outside @media blocks", () => {
    const root = postcss.parse(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
    const topLevelSelectors = root.nodes
      .filter((node): node is Rule => node.type === "rule")
      .map((rule) => rule.selector);

    expect(topLevelSelectors).toContain(".prerender-marketing-intro");
    expect(topLevelSelectors).toContain(".prerender-body");
  });

  it("matches SolutionPage hero geometry tokens", () => {
    expect(g.containerMaxWidthRem).toBe(64);
    expect(g.h1.baseFontSizeRem).toBe(2.25);
    expect(g.h1.baseLineHeightRem).toBe(2.5);
    expect(g.h1.mdFontSizeRem).toBe(3);
    expect(g.intro.fontSizeRem).toBe(1.125);
    expect(g.intro.lineHeight).toBe(1.625);
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain("line-height:2.5rem");
  });

  it("emits hero markup with shared H1 classes and styled intro", () => {
    const shell = buildSolutionMarketingPrerenderShell({
      heroH1: "Title",
      heroIntro: "Lead copy",
      bodyHtml: "<h2>Next</h2>",
    });
    expect(shell).toContain(`class="${SOLUTION_PAGE_HERO_H1_CLASS}"`);
    expect(shell).toContain('class="prerender-marketing-intro"');
    expect(shell).not.toContain("<h1>Title</h1>");
  });
});