import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_HERO_CRITICAL_CSS,
  HOMEPAGE_HERO_GEOMETRY,
  HOMEPAGE_HERO_H1_CLASS,
} from "@/lib/homepagePrerenderHero";

describe("built homepage prerender hero", () => {
  const distIndex = resolve(process.cwd(), "dist/index.html");
  const g = HOMEPAGE_HERO_GEOMETRY;

  it("includes the styled hero h1 with shared headline classes", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(html).toContain('data-prerender="hero-critical"');
    expect(html.indexOf('<style data-prerender="hero-critical">')).toBeLessThan(html.indexOf('<div id="root">'));
    expect(html).toContain('class="prerender-hero"');
    const h1Match = html.match(
      new RegExp(
        `<h1 class="${HOMEPAGE_HERO_H1_CLASS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([\\s\\S]*?)</h1>`,
      ),
    );
    expect(h1Match).toBeTruthy();
    expect(h1Match?.[1]).toContain("CMMS Software for Facility");
  });

  it("ships critical CSS whose hero geometry matches the React Hero shell", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    const styleMatch = html.match(/<style data-prerender="hero-critical">([\s\S]*?)<\/style>/);
    expect(styleMatch?.[1]?.trim()).toBe(HOMEPAGE_HERO_CRITICAL_CSS);

    const critical = styleMatch![1];
    expect(critical).toContain(`padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem`);
    expect(critical).toContain(
      `.prerender-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}`,
    );
    expect(critical).toContain(`font-size:${g.h1.baseFontSizeRem}rem`);
    expect(critical).toContain(`font-size:${g.h1.smFontSizeRem}rem`);
    expect(critical).toContain(`font-size:${g.h1.xlFontSizeRem}rem`);

    expect(html).toContain('class="prerender-hero-inner"');
  });
});