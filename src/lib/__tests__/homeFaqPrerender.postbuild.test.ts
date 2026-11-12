import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function countFaqPageJsonLdBlocks(html: string): number {
  const scripts = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  return scripts.filter((match) => {
    try {
      const parsed = JSON.parse(match[1]) as { "@type"?: string };
      return parsed["@type"] === "FAQPage";
    } catch {
      return false;
    }
  }).length;
}

describe("built homepage prerender", () => {
  const distIndex = resolve(process.cwd(), "dist/index.html");

  it("ships exactly one FAQPage JSON-LD block", () => {
    expect(existsSync(distIndex), "dist/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(countFaqPageJsonLdBlocks(html)).toBe(1);
    expect(html).toContain('data-rh="true"');
    expect(html).not.toMatch(/<\/script>\s*<script[^>]*>\s*alert/);
  });
});
