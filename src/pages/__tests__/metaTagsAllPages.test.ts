import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Wide regression guard: any marketing page that declares og:image MUST
 * also declare matching og:title, og:description, og:url, twitter:card,
 * twitter:title, twitter:description, twitter:image — and every og:image
 * / twitter:image must point at the canonical, cache-busted asset.
 *
 * Auto-discovers files under src/pages so newly added marketing routes
 * are covered without editing this test. Run alongside metaTags.test.ts
 * (curated key-page list) for layered coverage.
 */

const PAGES_DIR = resolve(process.cwd(), "src/pages");
const EXPECTED_IMAGE = "https://maintenease.com/og-image.png?v=3";

const REQUIRED_PROPERTY_TAGS = [
 "og:title",
 "og:description",
 "og:url",
 "og:image",
] as const;

const REQUIRED_NAME_TAGS = [
 "twitter:card",
 "twitter:title",
 "twitter:description",
 "twitter:image",
] as const;

function listPageFiles(): string[] {
 const files: string[] = [];
 for (const entry of readdirSync(PAGES_DIR, { withFileTypes: true })) {
 if (entry.isFile() && entry.name.endsWith(".tsx")) {
 files.push(resolve(PAGES_DIR, entry.name));
 }
 }
 return files;
}

// Extract every <meta ... /> JSX tag (single- or multi-line) as a chunk so
// each tag can be inspected independently — avoids regex bleed across tags.
function metaTags(source: string): string[] {
 const re = /<meta\b[^>]*?\/>/gs;
 return source.match(re) ?? [];
}

function hasTag(source: string, attr: "property" | "name", key: string): boolean {
 const tag = new RegExp(`${attr}=["']${key}["']`);
 return metaTags(source).some((t) => tag.test(t));
}

function extractImage(source: string, attr: "property" | "name", key: string): string | null {
 const matcher = new RegExp(`${attr}=["']${key}["']`);
 const contentRe = /content=["']([^"']+)["']/;
 for (const t of metaTags(source)) {
 if (matcher.test(t)) {
 const m = t.match(contentRe);
 if (m) return m[1];
 }
 }
 return null;
}

describe("og/twitter metadata regression across all marketing pages", () => {
 const files = listPageFiles();
 // Only consider pages that actually opt-in to social previews (declare og:image).
 const pagesWithOg = files.filter((file) =>
 /<meta\s+property=["']og:image["']/.test(readFileSync(file, "utf8")),
 );

 it("discovers at least the known marketing pages", () => {
 expect(pagesWithOg.length).toBeGreaterThanOrEqual(10);
 });

 for (const file of pagesWithOg) {
 const rel = file.replace(`${process.cwd()}/`, "");
 describe(rel, () => {
 const source = readFileSync(file, "utf8");

 for (const key of REQUIRED_PROPERTY_TAGS) {
 it(`declares <meta property="${key}">`, () => {
 expect(hasTag(source, "property", key), `${rel} missing ${key}`).toBe(true);
 });
 }
 for (const key of REQUIRED_NAME_TAGS) {
 it(`declares <meta name="${key}">`, () => {
 expect(hasTag(source, "name", key), `${rel} missing ${key}`).toBe(true);
 });
 }

 it("og:image points at the canonical cache-busted asset", () => {
 expect(extractImage(source, "property", "og:image")).toBe(EXPECTED_IMAGE);
 });
 it("twitter:image points at the canonical cache-busted asset", () => {
 expect(extractImage(source, "name", "twitter:image")).toBe(EXPECTED_IMAGE);
 });
 });
 }
});