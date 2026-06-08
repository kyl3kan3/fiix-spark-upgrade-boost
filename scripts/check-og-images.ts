#!/usr/bin/env tsx
/**
 * Fetches each key marketing URL and compares the rendered og:image and
 * twitter:image against the expected value. Exits with a non-zero status if
 * any tag is missing or mismatched — wire into CI before deploy.
 *
 * Usage:
 *   tsx scripts/check-og-images.ts
 *   BASE_URL=https://maintenease.lovable.app tsx scripts/check-og-images.ts
 */

const BASE_URL = process.env.BASE_URL ?? "https://maintenease.com";
const EXPECTED_IMAGE = "https://maintenease.com/og-image.png?v=2";

const PATHS = [
  "/",
  "/pricing",
  "/solutions",
  "/solutions/asset-management-software",
  "/solutions/work-order-software",
  "/learn",
  "/learn/cmms",
];

type CheckResult = { url: string; ok: boolean; messages: string[] };

function extract(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return m[1];
  // also try reversed attribute order
  const re2 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

async function checkPath(path: string): Promise<CheckResult> {
  const url = `${BASE_URL}${path}`;
  const messages: string[] = [];
  let ok = true;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return { url, ok: false, messages: [`HTTP ${res.status}`] };
    }
    const html = await res.text();
    const og = extract(html, "property", "og:image");
    const tw = extract(html, "name", "twitter:image");
    if (og !== EXPECTED_IMAGE) {
      ok = false;
      messages.push(`og:image mismatch — got ${og ?? "<missing>"}`);
    }
    if (tw !== EXPECTED_IMAGE) {
      ok = false;
      messages.push(`twitter:image mismatch — got ${tw ?? "<missing>"}`);
    }
  } catch (e) {
    ok = false;
    messages.push(`fetch failed: ${(e as Error).message}`);
  }
  return { url, ok, messages };
}

async function main() {
  console.log(`Checking og:image on ${BASE_URL} (expected ${EXPECTED_IMAGE})`);
  const results = await Promise.all(PATHS.map(checkPath));
  let failed = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`  ok   ${r.url}`);
    } else {
      failed += 1;
      console.log(`  FAIL ${r.url}`);
      for (const m of r.messages) console.log(`       - ${m}`);
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} of ${results.length} URLs failed og:image audit.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} URLs pass.`);
}

main();