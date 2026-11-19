import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildCompareCriticalCss } from "@/lib/marketingCriticalCssBuilder";

function readDistCss(): string {
  const assetsDir = resolve("dist/static");
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

describe("compare pricing critical CSS from built Tailwind", () => {
  it("includes leading-relaxed (1.625) on intro and compare summary utilities", () => {
    const css = buildCompareCriticalCss(readDistCss());
    expect(css).toMatch(/\.leading-relaxed\{[^}]*line-height:1\.625/);
    expect(css).toMatch(/\.text-lg\{[^}]*font-size:1\.125rem/);
    expect(css).toContain(".text-pretty");
  });

  it("includes sm:text-3xl breakpoint rules for compare h2", () => {
    const css = buildCompareCriticalCss(readDistCss());
    expect(css).toMatch(/@media \(width>=640px\)[\s\S]*\.sm\\:text-3xl/);
    expect(css).toMatch(/\.md\\:text-5xl/);
  });
});