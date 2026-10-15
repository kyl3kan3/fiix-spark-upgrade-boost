#!/usr/bin/env node
/**
 * Submit sitemap URLs to IndexNow (Bing, Yandex, and partners).
 *
 * Usage:
 *   node scripts/ping-indexnow.mjs
 *   node scripts/ping-indexnow.mjs --dry-run
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "maintenease.com";
const KEY = "f8a6105d40eb4c5b8a6fdb94cfec9f35";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const DRY_RUN = process.argv.includes("--dry-run");

const sitemapXml = readFileSync(resolve("public/sitemap.xml"), "utf8");
const urlList = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!urlList.includes(`https://${HOST}/tools/mtbf-calculator`)) {
  console.error("sitemap.xml is missing /tools/mtbf-calculator");
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

if (DRY_RUN) {
  console.log(JSON.stringify({ endpoint: ENDPOINT, urlCount: urlList.length, sample: urlList.slice(0, 3) }, null, 2));
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const text = await response.text();
console.log(JSON.stringify({ status: response.status, statusText: response.statusText, body: text || null }, null, 2));

if (!response.ok) {
  process.exit(1);
}
