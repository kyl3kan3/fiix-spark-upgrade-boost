import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HOMEPAGE_HERO_H1_CLASS } from "@/lib/homepagePrerenderHero";

describe("built homepage marketing SSR shell", () => {
  const distIndex = resolve(process.cwd(), "dist/index.html");

  it("marks the document for client hydration and ships the real Hero h1", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(html).toContain('id="root" data-ssr="marketing"');
    expect(html).toContain('data-ssr="hero-critical"');
    const h1Match = html.match(
      new RegExp(
        `<h1[^>]*class="[^"]*${HOMEPAGE_HERO_H1_CLASS.split(" ")[0]}[^"]*"[^>]*>([\\s\\S]*?)</h1>`,
      ),
    );
    expect(h1Match).toBeTruthy();
    expect(h1Match?.[1]).toContain("CMMS Software for Facility");
  });
});