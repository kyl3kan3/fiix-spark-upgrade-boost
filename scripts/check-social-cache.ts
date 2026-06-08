#!/usr/bin/env tsx
/**
 * Fetches each key marketing URL using the user-agents of the major social
 * crawlers (Facebook, LinkedIn, X/Twitter) and verifies that what each
 * crawler sees for og:image / og:title / og:description matches the
 * canonical values for the new navy/teal design.
 *
 * Optionally, if FB_APP_ACCESS_TOKEN is set in the environment, the script
 * also pings the Facebook Graph debugger with scrape=true to invalidate
 * Facebook's cache when a mismatch is detected.
 *
 * Exits non-zero if any crawler sees stale or wrong metadata — wire into a
 * scheduled workflow so alerts fire when caches diverge from the live site.
 *
 * Usage:
 *   tsx scripts/check-social-cache.ts
 *   BASE_URL=https://maintenease.lovable.app tsx scripts/check-social-cache.ts
 */

const BASE_URL = process.env.BASE_URL ?? "https://maintenease.com";
const EXPECTED_IMAGE = "https://maintenease.com/og-image.png?v=2";
const FB_TOKEN = process.env.FB_APP_ACCESS_TOKEN;
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

const PATHS = [
  "/",
  "/pricing",
  "/solutions",
  "/solutions/asset-management-software",
  "/solutions/work-order-software",
  "/learn",
  "/learn/cmms",
  "/auth",
];

const CRAWLERS: { name: string; ua: string }[] = [
  {
    name: "Facebook",
    ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  },
  {
    name: "LinkedIn",
    ua: "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
  },
  {
    name: "Twitter",
    ua: "Twitterbot/1.0",
  },
];

type Result = {
  url: string;
  crawler: string;
  ok: boolean;
  messages: string[];
};

function extract(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function extractCanonical(html: string): string | null {
  return (
    html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null
  );
}

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    let p = url.pathname.replace(/\/+$/, "");
    if (p === "") p = "/";
    return `${url.origin}${p}`;
  } catch {
    return u;
  }
}

let sitemapEntriesCache: Set<string> | null = null;
async function loadSitemapEntries(): Promise<Set<string>> {
  if (sitemapEntriesCache) return sitemapEntriesCache;
  const set = new Set<string>();
  try {
    const res = await fetch(SITEMAP_URL);
    if (res.ok) {
      const xml = await res.text();
      const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(xml))) set.add(normalizeUrl(m[1]));
    }
  } catch {
    // ignored — sitemap presence is asserted separately below.
  }
  sitemapEntriesCache = set;
  return set;
}

async function refreshFacebookCache(url: string): Promise<void> {
  if (!FB_TOKEN) return;
  try {
    const endpoint = `https://graph.facebook.com/v18.0/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(FB_TOKEN)}`;
    const res = await fetch(endpoint, { method: "POST" });
    if (!res.ok) {
      console.warn(`  ! Facebook cache refresh failed for ${url}: HTTP ${res.status}`);
    } else {
      console.log(`  ↻ Facebook cache invalidated for ${url}`);
    }
  } catch (e) {
    console.warn(`  ! Facebook cache refresh threw for ${url}: ${(e as Error).message}`);
  }
}

async function checkOne(path: string, crawler: { name: string; ua: string }): Promise<Result> {
  const url = `${BASE_URL}${path}`;
  const messages: string[] = [];
  let ok = true;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": crawler.ua, Accept: "text/html" },
    });
    if (!res.ok) {
      return { url, crawler: crawler.name, ok: false, messages: [`HTTP ${res.status}`] };
    }
    const html = await res.text();
    const og = extract(html, "property", "og:image");
    const ogTitle = extract(html, "property", "og:title");
    const ogDesc = extract(html, "property", "og:description");
    const ogUrl = extract(html, "property", "og:url");
    const canonical = extractCanonical(html);

    if (og !== EXPECTED_IMAGE) {
      ok = false;
      messages.push(`og:image mismatch — got ${og ?? "<missing>"}`);
    }
    if (!ogTitle) {
      ok = false;
      messages.push(`og:title missing`);
    }
    if (!ogDesc) {
      ok = false;
      messages.push(`og:description missing`);
    }
    if (!ogUrl) {
      ok = false;
      messages.push(`og:url missing`);
    }
    if (!canonical) {
      ok = false;
      messages.push(`canonical <link> missing`);
    }
    if (ogUrl && canonical && normalizeUrl(ogUrl) !== normalizeUrl(canonical)) {
      ok = false;
      messages.push(
        `og:url / canonical mismatch — og:url=${ogUrl} canonical=${canonical}`,
      );
    }
    const expectedAbs = normalizeUrl(url);
    if (canonical && normalizeUrl(canonical) !== expectedAbs) {
      ok = false;
      messages.push(`canonical does not match request URL — got ${canonical}`);
    }
    const sitemap = await loadSitemapEntries();
    if (sitemap.size > 0 && !sitemap.has(expectedAbs)) {
      ok = false;
      messages.push(`URL is not listed in sitemap.xml`);
    }
  } catch (e) {
    ok = false;
    messages.push(`fetch failed: ${(e as Error).message}`);
  }
  return { url, crawler: crawler.name, ok, messages };
}

async function main() {
  console.log(`Checking social-crawler preview on ${BASE_URL}`);
  console.log(`Expected og:image = ${EXPECTED_IMAGE}\n`);

  // Sanity: sitemap must be reachable at all.
  try {
    const sm = await fetch(SITEMAP_URL);
    if (!sm.ok) {
      console.error(`sitemap.xml unreachable: HTTP ${sm.status}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`sitemap.xml fetch failed: ${(e as Error).message}`);
    process.exit(1);
  }

  const tasks: Promise<Result>[] = [];
  for (const path of PATHS) {
    for (const crawler of CRAWLERS) {
      tasks.push(checkOne(path, crawler));
    }
  }
  const results = await Promise.all(tasks);

  let failed = 0;
  const failedUrls = new Set<string>();
  for (const r of results) {
    const tag = `[${r.crawler.padEnd(8)}]`;
    if (r.ok) {
      console.log(`  ok   ${tag} ${r.url}`);
    } else {
      failed += 1;
      failedUrls.add(r.url);
      console.log(`  FAIL ${tag} ${r.url}`);
      for (const m of r.messages) console.log(`         - ${m}`);
    }
  }

  if (failed > 0 && FB_TOKEN) {
    console.log(`\nInvalidating Facebook cache for ${failedUrls.size} URL(s)…`);
    await Promise.all([...failedUrls].map(refreshFacebookCache));
  }

  if (failed > 0) {
    console.error(
      `\n${failed} of ${results.length} crawler checks failed.\n` +
        `Re-run after caches refresh; if it persists, use each platform's ` +
        `debugger:\n` +
        `  • https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(BASE_URL)}\n` +
        `  • https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(BASE_URL)}\n` +
        `  • https://cards-dev.twitter.com/validator (Twitter retired the API)\n`,
    );
    process.exit(1);
  }
  console.log(`\nAll ${results.length} crawler checks pass.`);
}

main();