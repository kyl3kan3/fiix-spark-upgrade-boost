import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Automated meta-tag audit for key marketing pages.
 *
 * Verifies every page sets:
 * - twitter:card
 * - twitter:title
 * - twitter:description
 * - og:image (must point to https://maintenease.com/og-image.png)
 * - twitter:image (must point to https://maintenease.com/og-image.png)
 */

const KEY_PAGES = [
 "src/pages/Index.tsx",
 "src/pages/PricingPage.tsx",
 "src/pages/SolutionsIndex.tsx",
 "src/pages/SolutionPage.tsx",
 "src/pages/LearnIndex.tsx",
 "src/pages/LearnArticle.tsx",
];

const OG_IMAGE_URL = "https://maintenease.com/og-image.png";

const REQUIRED_TAGS: { name: string; regex: RegExp; mustContain?: string }[] = [
 { name: "twitter:card", regex: /<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/ },
 { name: "twitter:title", regex: /<meta\s+name=["']twitter:title["']\s+content=\{?["']?[^>]*\/>/ },
 { name: "twitter:description", regex: /<meta\s+name=["']twitter:description["']\s+content=\{?["']?[^>]*\/>/ },
 { name: "og:image", regex: /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/, mustContain: OG_IMAGE_URL },
 { name: "twitter:image", regex: /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/, mustContain: OG_IMAGE_URL },
];

describe("marketing page meta tags", () => {
 for (const page of KEY_PAGES) {
 describe(page, () => {
 const source = readFileSync(resolve(process.cwd(), page), "utf8");

 for (const tag of REQUIRED_TAGS) {
 it(`declares ${tag.name}`, () => {
 const match = source.match(tag.regex);
 expect(match, `${page} is missing <meta ${tag.name}>`).toBeTruthy();
 if (tag.mustContain && match && match[1]) {
 expect(match[1]).toBe(tag.mustContain);
 }
 });
 }

 it("renders Organization + WebSite JSON-LD via MarketingJsonLd", () => {
 expect(
 /MarketingJsonLd/.test(source),
 `${page} should render <MarketingJsonLd /> for Organization + WebSite structured data`,
 ).toBe(true);
 });
 });
 }
});

describe("MarketingJsonLd component", () => {
 const source = readFileSync(
 resolve(process.cwd(), "src/components/marketing/MarketingJsonLd.tsx"),
 "utf8",
 );
 it("emits Organization schema", () => {
 expect(source).toMatch(/"@type":\s*"Organization"/);
 });
 it("emits WebSite schema", () => {
 expect(source).toMatch(/"@type":\s*"WebSite"/);
 });
});