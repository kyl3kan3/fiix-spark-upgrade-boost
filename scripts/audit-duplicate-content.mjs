#!/usr/bin/env node
/**
 * Crawl sitemap routes and fail when two canonical pages expose the same
 * crawler-facing body, a route points at another canonical, or essential
 * page identity is missing.
 *
 * Usage:
 *   npm run check:duplicates
 *   npm run check:duplicates -- --live
 *   npm run check:duplicates -- --live --sitemap=https://maintenease.com/sitemap.xml
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST = join(ROOT, "dist");
const SITE_ORIGIN = "https://maintenease.com";
const LIVE = process.argv.includes("--live");
const sitemapArg = process.argv.find((arg) => arg.startsWith("--sitemap="));
const sitemapSource = sitemapArg?.slice("--sitemap=".length) || (
  LIVE ? `${SITE_ORIGIN}/sitemap.xml` : join(ROOT, "public", "sitemap.xml")
);

const errors = [];
const warnings = [];

const decodeEntities = (value) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const textFromHtml = (value) =>
  decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const capture = (html, pattern) => textFromHtml(html.match(pattern)?.[1] ?? "");

const canonicalFrom = (html) =>
  html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ??
  html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i)?.[1] ??
  "";

const canonicalUrl = (value) => {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
};

const contentHash = (content) =>
  createHash("sha256").update(content.toLocaleLowerCase("en-US")).digest("hex");

async function readSitemap(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source, { redirect: "follow" });
    if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}: ${source}`);
    return response.text();
  }
  return readFileSync(resolve(source), "utf8");
}

function distDocumentFor(url) {
  const pathname = new URL(url).pathname;
  return pathname === "/"
    ? join(DIST, "index.html")
    : join(DIST, pathname.replace(/^\/+/, ""), "index.html");
}

async function loadDocument(url) {
  if (LIVE) {
    const response = await fetch(url, { redirect: "manual" });
    return {
      html: await response.text(),
      status: response.status,
      redirect: response.headers.get("location") ?? "",
    };
  }

  const path = distDocumentFor(url);
  if (!existsSync(path)) return { html: "", status: 0, redirect: "", path };
  return { html: readFileSync(path, "utf8"), status: 200, redirect: "", path };
}

const sitemapXml = await readSitemap(sitemapSource);
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  canonicalUrl(decodeEntities(match[1].trim())),
);

if (urls.length === 0) {
  console.error(`Duplicate-content audit found no <loc> entries in ${sitemapSource}`);
  process.exit(1);
}

const duplicateSitemapUrls = Object.values(Object.groupBy(urls, (url) => url)).filter(
  (group) => group.length > 1,
);
for (const group of duplicateSitemapUrls) {
  errors.push(`Sitemap repeats ${group[0]} ${group.length} times`);
}

const rows = [];
for (let offset = 0; offset < urls.length; offset += 8) {
  const batch = urls.slice(offset, offset + 8);
  const results = await Promise.all(
    batch.map(async (url) => {
      try {
        const document = await loadDocument(url);
        const { html, status, redirect, path } = document;
        const prerenderBody =
          html.match(/<div[^>]+data-prerender=["']static["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
          html.match(/<div id=["']root["']>([\s\S]*?)<\/div>/i)?.[1] ??
          "";
        const body = textFromHtml(prerenderBody);
        return {
          url,
          path,
          status,
          redirect,
          title: capture(html, /<title>([\s\S]*?)<\/title>/i),
          description:
            html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ??
            html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description/i)?.[1] ??
            "",
          canonical: canonicalFrom(html),
          h1: capture(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
          body,
          hash: body ? contentHash(body) : "",
        };
      } catch (error) {
        return { url, status: 0, error: error.message };
      }
    }),
  );
  rows.push(...results);
}

for (const row of rows) {
  const label = LIVE ? row.url : row.path ?? row.url;
  if (row.error) {
    errors.push(`${label}: ${row.error}`);
    continue;
  }
  if (row.status !== 200) {
    errors.push(
      `${label}: expected HTTP 200${LIVE ? `, received ${row.status}` : " or a built document"}${
        row.redirect ? ` (Location: ${row.redirect})` : ""
      }`,
    );
    continue;
  }
  if (!row.title) errors.push(`${label}: missing <title>`);
  if (!row.description) errors.push(`${label}: missing meta description`);
  if (!row.h1) errors.push(`${label}: missing <h1>`);
  if (!row.body) errors.push(`${label}: missing crawler-facing body`);
  if (!row.canonical) {
    errors.push(`${label}: missing rel=canonical`);
  } else if (canonicalUrl(row.canonical) !== row.url) {
    errors.push(`${label}: canonical is ${row.canonical}, expected ${row.url}`);
  }
  const wordCount = row.body ? row.body.split(/\s+/).length : 0;
  if (wordCount < 20) warnings.push(`${label}: crawler-facing body has only ${wordCount} words`);
}

const duplicateBodies = Object.values(Object.groupBy(rows.filter((row) => row.hash), (row) => row.hash))
  .filter((group) => group.length > 1);
for (const group of duplicateBodies) {
  errors.push(
    `Identical crawler-facing content (${group[0].hash.slice(0, 12)}) at:\n` +
      group.map((row) => `  - ${row.url}`).join("\n"),
  );
}

console.log(
  `Duplicate-content audit: ${rows.length} sitemap routes, ` +
    `${new Set(rows.map((row) => row.hash).filter(Boolean)).size} distinct body hashes`,
);
console.log(`Source: ${LIVE ? sitemapSource : `dist/ using ${sitemapSource}`}`);
for (const warning of warnings) console.log(`! ${warning}`);
for (const error of errors) console.error(`✗ ${error}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log(`✓ No exact duplicate bodies or canonical mismatches found`);
console.log(`\n0 error(s), ${warnings.length} warning(s)`);
