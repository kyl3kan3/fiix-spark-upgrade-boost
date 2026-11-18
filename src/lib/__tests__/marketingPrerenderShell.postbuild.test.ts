import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SOLUTION_MARKETING_HERO_CRITICAL_CSS,
  SOLUTION_PAGE_HERO_H1_CLASS,
} from "@/lib/marketingPrerenderShell";

describe("built solution marketing prerender hero", () => {
  const distPath = resolve(
    process.cwd(),
    "dist/solutions/work-order-software/index.html",
  );

  it("includes critical CSS and styled intro for LCP", () => {
    expect(existsSync(distPath), "dist missing — run npm run build").toBe(true);
    const html = readFileSync(distPath, "utf8");
    const styleMatch = html.match(/<style data-prerender="hero-critical">([\s\S]*?)<\/style>/);
    expect(styleMatch?.[1]?.trim()).toBe(SOLUTION_MARKETING_HERO_CRITICAL_CSS);
    expect(html).toContain('class="prerender-marketing-hero"');
    expect(html).toContain('class="prerender-marketing-intro"');
    expect(html).toMatch(
      new RegExp(
        `<h1 class="${SOLUTION_PAGE_HERO_H1_CLASS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">`,
      ),
    );
    expect(html).not.toMatch(/<main[^>]*>\s*<h1>/);
  });
});