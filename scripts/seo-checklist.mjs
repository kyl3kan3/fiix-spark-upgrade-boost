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
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
const descTag = indexTsx.match(/<meta\b[^>]*name="description"[^>]*>/s)?.[0] ?? "";
const descMatch = descTag.match(/content="([^"]+)"/);
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
// Index.tsx owns the single homepage H1 (Hero renders an H2 below it).
if (!/<h1[\s>]/.test(indexTsx)) fail("Index.tsx (homepage H1 owner) has no <h1>");
const homeH1Count = (indexTsx.match(/<h1[\s>]/g) ?? []).length +
  (readFileSync(join(ROOT, "src/components/Hero.tsx"), "utf8").match(/<h1[\s>]/g) ?? []).length;
if (homeH1Count !== 1) fail(`Homepage should render exactly 1 <h1>, found ${homeH1Count}`);
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

// 5. Prerendered crawler HTML (only when dist/ exists — after `npm run build`)
const distDir = join(ROOT, "dist");
if (existsSync(distDir)) {
  const prerenderSamples = [
    "index.html",
    "pricing/index.html",
    "learn/mtbf/index.html",
    "compare/index.html",
    "cmms-cost-calculator/index.html",
  ];
  let prerenderOk = 0;
  for (const rel of prerenderSamples) {
    const full = join(distDir, rel);
    if (!existsSync(full)) {
      fail(`prerender: dist/${rel} missing (run \`npm run build\`)`);
      continue;
    }
    const html = readFileSync(full, "utf8");
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1s !== 1) fail(`prerender: dist/${rel} has ${h1s} <h1> (expected exactly 1)`);
    else if (!/rel="canonical"/.test(html)) fail(`prerender: dist/${rel} has no canonical`);
    else if (!/<meta name="description"/.test(html)) fail(`prerender: dist/${rel} has no description`);
    else if (!/<meta name="robots" content="index,follow,max-image-preview:large"/.test(html)) {
      fail(`prerender: dist/${rel} is missing indexable robots metadata`);
    }
    else prerenderOk++;
  }
  if (prerenderOk === prerenderSamples.length) {
    pass(`Prerendered crawler HTML valid for ${prerenderOk} sampled routes`);
  }

  const appShellPath = join(distDir, "app-shell");
  if (!existsSync(appShellPath)) {
    fail("routing: dist/app-shell missing");
  } else {
    const appShell = readFileSync(appShellPath, "utf8");
    if (!/<meta name="robots" content="noindex,nofollow"/.test(appShell)) {
      fail("routing: app shell is missing noindex,nofollow");
    } else if (/rel="canonical"/.test(appShell)) {
      fail("routing: app shell must not inherit the homepage canonical");
    } else {
      pass("Protected-route app shell is noindex and has no canonical");
    }
  }

  const notFoundPath = join(distDir, "404.html");
  if (!existsSync(notFoundPath)) {
    fail("routing: dist/404.html missing");
  } else if (!/<meta name="robots" content="noindex,nofollow"/.test(readFileSync(notFoundPath, "utf8"))) {
    fail("routing: 404 document is missing noindex,nofollow");
  } else {
    pass("Static 404 document is noindex");
  }

  const pagesRoutes = JSON.parse(readFileSync(join(ROOT, "public", "_routes.json"), "utf8"));
  if (pagesRoutes.exclude.includes("/assets/*")) {
    fail("routing: _routes.json must not exclude /assets/* because it is also an application route");
  }

  // Keep the maintenance-simplified guide from regressing to its former
  // heading-plus-intro shell. This route needs enough practical body copy for
  // a crawler to understand the workflow and the product facts it discusses.
  const simplifiedPath = join(distDir, "maintenance-simplified", "index.html");
  if (!existsSync(simplifiedPath)) {
    fail("prerender: dist/maintenance-simplified/index.html missing");
  } else {
    const html = readFileSync(simplifiedPath, "utf8");
    const shellBody = html.match(/<noscript data-prerender="static"[^>]*>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
    const text = shellBody
      .replace(/<[^>]+>/g, " ")
      .replace(/&(?:amp|quot|#39);/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
    if (wordCount < 350) {
      fail(`prerender: maintenance-simplified has only ${wordCount} words (expected at least 350)`);
    } else {
      pass(`Maintenance-simplified prerender has ${wordCount} words`);
    }

    for (const phrase of [
      "Flat account pricing",
      "unlimited assets and unlimited work orders",
      "Predictive maintenance for earlier action",
    ]) {
      if (!text.toLowerCase().includes(phrase.toLowerCase())) {
        fail(`prerender: maintenance-simplified is missing required copy: "${phrase}"`);
      }
    }
  }
} else {
  warn("dist/ not built — skipped prerender checks (run `npm run build` first)");
}

// 6. Sitemap URL crawl (optional, requires --live)
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
