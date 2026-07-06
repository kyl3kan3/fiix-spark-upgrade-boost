#!/usr/bin/env node
/**
 * Lightweight SEO regression checker.
 *
 * Runs local static checks (no network needed) plus an optional live crawl
 * of every URL in public/sitemap.xml when `--live` is passed.
 *
 * Usage:
 *   node scripts/seo-checklist.mjs         # static checks only
 *   node scripts/seo-checklist.mjs --live  # + fetch every sitemap URL
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LIVE = process.argv.includes("--live");
const errors = [];
const warnings = [];
const pass = (msg) => console.log(`\u2713 ${msg}`);
const fail = (msg) => { errors.push(msg); console.log(`\u2717 ${msg}`); };
const warn = (msg) => { warnings.push(msg); console.log(`! ${msg}`); };

// 1. index.html title + description
const indexHtml = readFileSync(join(ROOT, "index.html"), "utf8");
const titleMatch = indexHtml.match(/<title>([^<]*)<\/title>/);
if (!titleMatch) fail("index.html: <title> missing");
else {
  const t = titleMatch[1].trim();
  if (t.length < 20 || t.length > 65) warn(`index.html <title> is ${t.length} chars (aim 20\u201365): "${t}"`);
  else if (/lovable/i.test(t)) fail(`index.html <title> still contains template default: "${t}"`);
  else pass(`index.html <title> looks good (${t.length} chars)`);
}

// 2. Homepage description (lives in src/pages/Index.tsx Helmet)
const indexTsx = readFileSync(join(ROOT, "src/pages/Index.tsx"), "utf8");
const descMatch = indexTsx.match(/<meta name="description" content="([^"]+)"/);
if (!descMatch) fail("Index.tsx: homepage <meta name=\"description\"> missing");
else {
  const d = descMatch[1];
  if (d.length < 50 || d.length > 160) fail(`Homepage description is ${d.length} chars (must be 50\u2013160)`);
  else pass(`Homepage description is ${d.length} chars`);
}

// 3. Every marketing page component must contain an <h1
const marketingPages = [
  "src/pages/PricingPage.tsx",
  "src/pages/SolutionsIndex.tsx",
  "src/pages/SolutionPage.tsx",
  "src/pages/LearnIndex.tsx",
  "src/pages/LearnArticle.tsx",
  "src/pages/FeaturesPage.tsx",
  "src/pages/CompareIndex.tsx",
  "src/pages/ComparePage.tsx",
  "src/pages/CostCalculatorPage.tsx",
];
for (const p of marketingPages) {
  const src = readFileSync(join(ROOT, p), "utf8");
  if (!/<h1[\s>]/.test(src)) fail(`${p} has no <h1>`);
}
// Index.tsx renders <Hero /> which owns the H1.
const heroSrc = readFileSync(join(ROOT, "src/components/Hero.tsx"), "utf8");
if (!/<h1[\s>]/.test(heroSrc)) fail("Hero.tsx (homepage H1 owner) has no <h1>");
pass("Every marketing page has an <h1>");

// 4. <img> tags in src/ must have an alt attribute
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (/\.(tsx|jsx|html)$/.test(name)) yield full;
  }
}
let imgTotal = 0;
let imgBad = 0;
for (const file of walk(join(ROOT, "src"))) {
  const src = readFileSync(file, "utf8");
  const imgs = src.match(/<img\b[^>]*>/g) ?? [];
  for (const tag of imgs) {
    imgTotal++;
    if (!/\balt\s*=/.test(tag)) {
      imgBad++;
      fail(`Missing alt in ${relative(ROOT, file)}: ${tag.slice(0, 120)}`);
    }
  }
}
if (imgBad === 0) pass(`All ${imgTotal} <img> tags carry alt text`);

// 5. Sitemap URL crawl (optional, requires --live)
if (LIVE) {
  const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`\nCrawling ${urls.length} sitemap URLs...`);
  const results = await Promise.all(urls.map(async (u) => {
    try {
      const r = await fetch(u, { method: "HEAD", redirect: "follow" });
      return { u, code: r.status };
    } catch (e) {
      return { u, code: 0, err: e.message };
    }
  }));
  for (const { u, code, err } of results) {
    if (code >= 200 && code < 400) continue;
    fail(`Sitemap URL ${code || "ERR"}: ${u}${err ? " (" + err + ")" : ""}`);
  }
  const okCount = results.filter((r) => r.code >= 200 && r.code < 400).length;
  pass(`${okCount}/${urls.length} sitemap URLs reachable`);
}

console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);