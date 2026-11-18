import postcss from "postcss";
import type { Rule } from "postcss";
import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_HERO_CRITICAL_CSS,
  HOMEPAGE_HERO_GEOMETRY,
  buildHomepagePrerenderShell,
} from "@/lib/homepagePrerenderHero";

/** Fails when `{` / `}` are unbalanced outside quoted strings. */
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

describe("homepage prerender hero geometry", () => {
  const g = HOMEPAGE_HERO_GEOMETRY;

  it("matches React Hero layout tokens (Tailwind class mapping)", () => {
    expect(g.containerMaxWidthRem).toBe(80);
    expect(g.containerPaddingXRem).toBe(1);
    expect(g.paddingTopRem).toBe(7);
    expect(g.paddingBottomRem).toBe(4);
    expect(g.paddingTopMdRem).toBe(9);
    expect(g.paddingBottomMdRem).toBe(6);
    expect(g.h1.baseFontSizeRem).toBe(2.75);
    expect(g.h1.smFontSizeRem).toBe(3.75);
    expect(g.h1.xlFontSizeRem).toBe(4.5);
  });

  it("applies vertical-only padding on the hero shell (no double px-4)", () => {
    expect(HOMEPAGE_HERO_CRITICAL_CSS).toContain(
      `.prerender-hero{background-color:hsl(207 22% 10%);color:#fff;padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem;overflow:hidden}`,
    );
    expect(HOMEPAGE_HERO_CRITICAL_CSS).not.toMatch(/\.prerender-hero\{[^}]*padding:[^;]*1rem[^0]/);
    expect(HOMEPAGE_HERO_CRITICAL_CSS).toContain(
      `.prerender-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}`,
    );
  });

  it("parses HOMEPAGE_HERO_CRITICAL_CSS with postcss", () => {
    expect(() => postcss.parse(HOMEPAGE_HERO_CRITICAL_CSS)).not.toThrow();
  });

  it("keeps balanced braces in HOMEPAGE_HERO_CRITICAL_CSS", () => {
    assertBalancedCssBraces(HOMEPAGE_HERO_CRITICAL_CSS);
  });

  it("declares lead and body selectors as top-level rules (not trapped in @media)", () => {
    const root = postcss.parse(HOMEPAGE_HERO_CRITICAL_CSS);
    const topLevelSelectors = root.nodes
      .filter((node): node is Rule => node.type === "rule")
      .map((rule) => rule.selector);

    expect(topLevelSelectors).toContain(".prerender-hero-lead");
    expect(topLevelSelectors).toContain(".prerender-body");
  });

  it("emits a single horizontal inset on the inner container in built shell markup", () => {
    const shell = buildHomepagePrerenderShell({
      heroH1: "Title",
      heroIntro: "Lead",
      bodyHtml: "<p>body</p>",
    });
    expect(shell).toContain('class="prerender-hero-inner"');
    expect(shell).not.toMatch(/prerender-hero[^>]*style="[^"]*padding/);
  });
});