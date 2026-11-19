import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildHomepageCriticalCss } from "@/lib/marketingCriticalCssBuilder";
import {
  HOMEPAGE_HERO_GEOMETRY,
  HOMEPAGE_HERO_H1_CLASS,
  HOMEPAGE_HERO_LEAD_CLASS,
} from "@/lib/homepagePrerenderHero";
function readDistCss(): string {
  const assetsDir = resolve("dist/static");
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

describe("built homepage prerender hero", () => {
  const distIndex = resolve(process.cwd(), "dist/index.html");
  const g = HOMEPAGE_HERO_GEOMETRY;

  it("includes the styled hero h1 with shared headline classes", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(html).toContain('data-prerender="hero-critical"');
    expect(html.indexOf('<style data-prerender="hero-critical">')).toBeLessThan(html.indexOf('<div id="root">'));
    expect(html).toContain('class="prerender-hero"');
    expect(html).toContain(HOMEPAGE_HERO_LEAD_CLASS);
    const h1Match = html.match(
      new RegExp(
        `<h1 class="${HOMEPAGE_HERO_H1_CLASS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([\\s\\S]*?)</h1>`,
      ),
    );
    expect(h1Match).toBeTruthy();
    expect(h1Match?.[1]).toContain("CMMS Software for Facility");
  });

  it("ships extracted Tailwind critical CSS for hero typography", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    const styleMatch = html.match(/<style data-prerender="hero-critical">([\s\S]*?)<\/style>/);
    const expected = buildHomepageCriticalCss(readDistCss());
    expect(styleMatch?.[1]?.trim()).toBe(expected);

    const critical = styleMatch![1];
    expect(critical).toContain(`padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem`);
    expect(critical).toContain(
      `.prerender-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}`,
    );
    expect(critical).toMatch(/\.leading-relaxed\{[^}]*line-height:1\.625/);
    expect(critical).toMatch(/line-height:1\.625/);
    expect(html).toContain('class="prerender-hero-inner"');
  });
});