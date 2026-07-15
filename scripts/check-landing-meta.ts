#!/usr/bin/env tsx
/**
 * Deploy-time sanity check for the /landing route.
 *
 * Fetches the rendered HTML and asserts:
 *   - <title> and <meta name="description"> exist
 *   - <link rel="canonical"> points at the /landing URL
 *   - <meta name="robots"> exists and does not block indexing
 *   - og:title / og:description / og:url / og:type / og:image
 *   - twitter:card / twitter:title / twitter:description / twitter:image
 *   - og:image + twitter:image resolve (HTTP 200) and are image/*
 *   - FAQPage and SoftwareApplication JSON-LD blocks parse and are non-empty
 *
 * Exits non-zero on any failure. Wire into CI before deploy.
 *
 * Usage:
 *   tsx scripts/check-landing-meta.ts
 *   BASE_URL=https://maintenease.lovable.app tsx scripts/check-landing-meta.ts
 */

const BASE_URL = process.env.BASE_URL ?? "https://maintenease.com";
const PATH = "/landing";

function extract(
  html: string,
  attr: "property" | "name",
  key: string,
): string | null {
  const patterns = [
    new RegExp(
      `<meta\\s+[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${key}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  );
  return m ? m[1] : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractJsonLd(html: string): unknown[] {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  const out: unknown[] = [];
  for (const b of blocks) {
    try {
      out.push(JSON.parse(b[1]));
    } catch {
      // Ignore malformed blocks — they'll surface as missing @type below.
    }
  }
  return out;
}

async function assertImage(url: string, label: string, errs: string[]) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) {
      errs.push(`${label}: HTTP ${res.status} for ${url}`);
      return;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) {
      errs.push(`${label}: content-type "${ct}" is not image/* (${url})`);
    }
  } catch (e) {
    errs.push(`${label}: fetch failed (${(e as Error).message}) for ${url}`);
  }
}

async function main() {
  const url = `${BASE_URL}${PATH}`;
  console.log(`Auditing ${url}`);
  const errs: string[] = [];

  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    console.error(`FAIL — HTTP ${res.status} fetching ${url}`);
    process.exit(1);
  }
  const html = await res.text();

  const title = extractTitle(html);
  if (!title) errs.push("<title> missing");

  const desc = extract(html, "name", "description");
  if (!desc) errs.push('<meta name="description"> missing');

  const canonical = extractCanonical(html);
  if (!canonical) errs.push('<link rel="canonical"> missing');
  else if (!canonical.endsWith(PATH))
    errs.push(`canonical "${canonical}" does not point at ${PATH}`);

  const robots = extract(html, "name", "robots");
  if (!robots) errs.push('<meta name="robots"> missing');
  else if (/noindex/i.test(robots))
    errs.push(`robots meta blocks indexing: "${robots}"`);

  const required = {
    "og:title": extract(html, "property", "og:title"),
    "og:description": extract(html, "property", "og:description"),
    "og:url": extract(html, "property", "og:url"),
    "og:type": extract(html, "property", "og:type"),
    "og:image": extract(html, "property", "og:image"),
    "twitter:card": extract(html, "name", "twitter:card"),
    "twitter:title": extract(html, "name", "twitter:title"),
    "twitter:description": extract(html, "name", "twitter:description"),
    "twitter:image": extract(html, "name", "twitter:image"),
  };
  for (const [k, v] of Object.entries(required)) {
    if (!v) errs.push(`${k} missing`);
  }

  if (required["og:image"])
    await assertImage(required["og:image"], "og:image", errs);
  if (required["twitter:image"] && required["twitter:image"] !== required["og:image"])
    await assertImage(required["twitter:image"], "twitter:image", errs);

  const jsonld = extractJsonLd(html);
  const types = jsonld
    .map((b) => (b as { "@type"?: string })["@type"])
    .filter(Boolean);
  if (!types.includes("FAQPage")) errs.push("FAQPage JSON-LD missing");
  if (!types.includes("SoftwareApplication"))
    errs.push("SoftwareApplication JSON-LD missing");

  const faq = jsonld.find(
    (b) => (b as { "@type"?: string })["@type"] === "FAQPage",
  ) as { mainEntity?: unknown[] } | undefined;
  if (faq && (!faq.mainEntity || faq.mainEntity.length === 0))
    errs.push("FAQPage has no mainEntity questions");

  if (errs.length === 0) {
    console.log(`ok — ${Object.keys(required).length + 4} checks passed`);
    return;
  }
  console.error(`FAIL — ${errs.length} issue(s) on ${url}:`);
  for (const e of errs) console.error(`  - ${e}`);
  process.exit(1);
}

main();