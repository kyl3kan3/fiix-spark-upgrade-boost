import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HOMEPAGE_HERO_H1_CLASS } from "@/lib/homepagePrerenderHero";

describe("built homepage prerender hero", () => {
  const distIndex = resolve(process.cwd(), "dist/index.html");

  it("includes the styled hero h1 with shared headline classes", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(html).toContain('data-prerender="hero-critical"');
    expect(html).toContain('class="prerender-hero"');
    const h1Match = html.match(
      new RegExp(
        `<h1 class="${HOMEPAGE_HERO_H1_CLASS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([\\s\\S]*?)</h1>`,
      ),
    );
    expect(h1Match).toBeTruthy();
    expect(h1Match?.[1]).toContain("CMMS Software for Facility");
  });
});