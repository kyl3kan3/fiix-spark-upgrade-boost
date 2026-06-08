import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Validates that index.html — the only HTML a non-JS social crawler sees —
 * carries the canonical OG/Twitter fallback tags pointing at the navy/teal
 * og-image asset. If JavaScript is disabled, these are the values that
 * Facebook/LinkedIn/X will use.
 */

const EXPECTED_IMAGE = "https://maintenease.com/og-image.png?v=2";
const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

function metaProperty(key: string): string | null {
  return (
    html.match(
      new RegExp(
        `<meta\\s+property=["']${key}["']\\s+content=["']([^"']+)["']`,
        "i",
      ),
    )?.[1] ?? null
  );
}
function metaName(key: string): string | null {
  return (
    html.match(
      new RegExp(`<meta\\s+name=["']${key}["']\\s+content=["']([^"']+)["']`, "i"),
    )?.[1] ?? null
  );
}

describe("index.html static OG/Twitter fallback (no-JS crawlers)", () => {
  it("declares <title> with MaintenEase brand", () => {
    const t = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
    expect(t).toMatch(/MaintenEase/);
  });

  it("serves og:type=website", () => {
    expect(metaProperty("og:type")).toBe("website");
  });

  it("serves og:image pointing at canonical cache-busted asset", () => {
    expect(metaProperty("og:image")).toBe(EXPECTED_IMAGE);
  });

  it("serves twitter:card=summary_large_image", () => {
    expect(metaName("twitter:card")).toBe("summary_large_image");
  });

  it("serves twitter:image pointing at canonical cache-busted asset", () => {
    expect(metaName("twitter:image")).toBe(EXPECTED_IMAGE);
  });

  it("does NOT hard-code a sitewide <link rel=canonical> (per-route owns it)", () => {
    // A static canonical in index.html would conflict with per-route
    // <Helmet><link rel=canonical>, producing duplicate canonicals.
    const hasStaticCanonical = /<link\s+[^>]*rel=["']canonical["']/i.test(html);
    expect(hasStaticCanonical).toBe(false);
  });

  it("does NOT declare per-page og:title/og:description statically", () => {
    // These are intentionally per-route via react-helmet-async to avoid
    // duplicate-tag SEO flags. Failing here means someone re-added them.
    expect(metaProperty("og:title")).toBeNull();
    expect(metaProperty("og:description")).toBeNull();
    expect(metaProperty("og:url")).toBeNull();
  });
});