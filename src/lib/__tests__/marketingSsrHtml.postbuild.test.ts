import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MARKETING_ROUTES: Array<{ rel: string; titleSnippet: string }> = [
  { rel: "index.html", titleSnippet: "MaintenEase" },
  { rel: "pricing/index.html", titleSnippet: "Pricing" },
  { rel: "solutions/work-order-software/index.html", titleSnippet: "Work Order" },
  { rel: "solutions/preventive-maintenance-software/index.html", titleSnippet: "Preventive" },
  { rel: "compare/maintenease-vs-maintainx/index.html", titleSnippet: "MaintainX" },
  { rel: "compare/maintenease-vs-fiix/index.html", titleSnippet: "Fiix" },
  { rel: "learn/cmms/index.html", titleSnippet: "CMMS" },
];

function distPath(rel: string) {
  return resolve(process.cwd(), "dist", rel);
}

function countMetaDescription(html: string): number {
  return [...html.matchAll(/<meta[^>]*\bname=["']description["'][^>]*>/gi)].length;
}

function countCanonical(html: string): number {
  return [...html.matchAll(/<link[^>]*\brel=["']canonical["'][^>]*>/gi)].length;
}

function countJsonLdBlocks(html: string): number {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi)].length;
}

describe("marketing SSR prerendered HTML", () => {
  for (const route of MARKETING_ROUTES) {
    it(`ships one SEO head + marketing root for ${route.rel}`, () => {
      const file = distPath(route.rel);
      expect(existsSync(file), `${route.rel} missing — run npm run build`).toBe(true);
      const html = readFileSync(file, "utf8");
      expect(html).toContain('data-ssr="marketing"');
      expect(html).toContain("<title");
      expect(html).toContain(route.titleSnippet);
      expect(countMetaDescription(html)).toBe(1);
      expect(countCanonical(html)).toBe(1);
      expect(countJsonLdBlocks(html)).toBeGreaterThanOrEqual(1);
      expect(html).not.toMatch(/\$!--/);
    });
  }
});