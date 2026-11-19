import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { comparisons } from "@/data/comparisons";
import { buildSolutionCriticalCss } from "@/lib/marketingCriticalCssBuilder";
import {
  assertCompareHeroParity,
  assertSolutionHeroParity,
} from "@/lib/marketingPrerenderShell";

function readDistCss(): string {
  const assetsDir = resolve("dist/static");
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

describe("built marketing prerender heroes", () => {
  it("solution work-order hero matches SolutionPage structure", () => {
    const distPath = resolve(
      process.cwd(),
      "dist/solutions/work-order-software/index.html",
    );
    expect(existsSync(distPath), "dist missing — run npm run build").toBe(true);
    const html = readFileSync(distPath, "utf8");
    const styleMatch = html.match(/<style data-prerender="hero-critical">([\s\S]*?)<\/style>/);
    expect(styleMatch?.[1]?.trim()).toBe(buildSolutionCriticalCss(readDistCss()));
    expect(html.indexOf('<style data-prerender="hero-critical">')).toBeLessThan(html.indexOf('<div id="root">'));
    const critical = styleMatch![1];
    expect(critical).toMatch(/\.leading-relaxed\{[^}]*line-height:1\.625/);
    expect(critical).toMatch(/\.text-pretty/);
    expect(critical).toMatch(/\.md\\:text-5xl/);
    assertSolutionHeroParity(html);
  });

  it("compare maintainx hero matches ComparePage structure (no hero intro)", () => {
    const distPath = resolve(
      process.cwd(),
      "dist/compare/maintenease-vs-maintainx/index.html",
    );
    expect(existsSync(distPath), "dist missing — run npm run build").toBe(true);
    const html = readFileSync(distPath, "utf8");
    assertCompareHeroParity(html);
    const maintainx = comparisons.find((c) => c.slug === "maintenease-vs-maintainx");
    expect(maintainx?.pricingTable?.summary).toBeTruthy();
    expect(html).toContain(maintainx!.pricingTable!.summary);
  });

  it.each(comparisons.map((c) => c.slug))(
    "compare %s prerender includes pricing summary when defined",
    (slug) => {
      const comparison = comparisons.find((c) => c.slug === slug);
      const distPath = resolve(process.cwd(), `dist/compare/${slug}/index.html`);
      expect(existsSync(distPath), "dist missing — run npm run build").toBe(true);
      const html = readFileSync(distPath, "utf8");
      assertCompareHeroParity(html);
      if (comparison?.pricingTable) {
        expect(html).toContain(comparison.pricingTable.summary);
        expect(html).toContain(comparison.pricingTable.heading);
        const headingCount = html.split(`<h2 class="font-headline text-2xl`).length - 1;
        const summaryInMain = (html.split('<div class="prerender-body">')[0] ?? "").split(
          comparison.pricingTable.summary,
        ).length - 1;
        expect(summaryInMain).toBe(1);
        expect(headingCount).toBeLessThanOrEqual(1);
      }
    },
  );
});