import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_HERO_GEOMETRY,
  HOMEPAGE_HERO_LEAD_CLASS,
  buildHomepagePrerenderShell,
} from "@/lib/homepagePrerenderHero";

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
    expect(g.leadLineHeight).toBe(1.625);
  });

  it("emits shared lead classes in built shell markup", () => {
    const shell = buildHomepagePrerenderShell({
      heroH1: "Title",
      heroIntro: "Lead",
      bodyHtml: "<p>body</p>",
    });
    expect(shell).toContain(`class="${HOMEPAGE_HERO_LEAD_CLASS}"`);
    expect(shell).toContain('class="prerender-hero-inner"');
    expect(shell).not.toMatch(/prerender-hero[^>]*style="[^"]*padding/);
  });
});