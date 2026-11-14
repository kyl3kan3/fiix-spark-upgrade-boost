import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isSoftwareApplicationType } from "@/data/mtbfCalculatorJsonLd";

function parseJsonLdBlocks(html: string): unknown[] {
  return [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ]
    .map((match) => {
      try {
        return JSON.parse(match[1]) as unknown;
      } catch {
        return null;
      }
    })
    .filter((block): block is Record<string, unknown> => block != null && typeof block === "object");
}

function countByType(html: string, type: string): number {
  return parseJsonLdBlocks(html).filter(
    (block) => (block as { "@type"?: string })["@type"] === type,
  ).length;
}

function countSoftwareApplicationBlocks(html: string): number {
  return parseJsonLdBlocks(html).filter((block) => isSoftwareApplicationType(block as { "@type"?: string | string[] }))
    .length;
}

describe("built /tools/mtbf-calculator prerender", () => {
  const distIndex = resolve(process.cwd(), "dist/tools/mtbf-calculator/index.html");

  it("ships exactly one SoftwareApplication-type JSON-LD block and one FAQPage", () => {
    expect(existsSync(distIndex), "dist/tools/mtbf-calculator/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(countSoftwareApplicationBlocks(html)).toBe(1);
    expect(countByType(html, "FAQPage")).toBe(1);
    expect(html).not.toMatch(/<\/script>\s*<script[^>]*>\s*alert/);
  });
});