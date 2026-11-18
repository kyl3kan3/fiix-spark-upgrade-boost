import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SOLUTION_MARKETING_HERO_CRITICAL_CSS,
  assertCompareHeroParity,
  assertSolutionHeroParity,
} from "@/lib/marketingPrerenderShell";

describe("built marketing prerender heroes", () => {
  it("solution work-order hero matches SolutionPage structure", () => {
    const distPath = resolve(
      process.cwd(),
      "dist/solutions/work-order-software/index.html",
    );
    expect(existsSync(distPath), "dist missing — run npm run build").toBe(true);
    const html = readFileSync(distPath, "utf8");
    const styleMatch = html.match(/<style data-prerender="hero-critical">([\s\S]*?)<\/style>/);
    expect(styleMatch?.[1]?.trim()).toBe(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
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
  });
});