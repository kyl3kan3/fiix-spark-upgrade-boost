#!/usr/bin/env tsx
/**
 * Snapshots og:* / twitter:* / canonical / JSON-LD for every key marketing
 * page on the live site, writes a timestamped JSON file under
 * reports/meta-history/, and produces a human-readable Markdown diff
 * against the previous snapshot.
 *
 * Outputs:
 *   reports/meta-history/<ISO>.json   — full snapshot
 *   reports/meta-history/latest.json  — pointer to the newest snapshot
 *   reports/meta-history/latest-diff.md — diff vs the previous snapshot
 *
 * Usage:
 *   tsx scripts/snapshot-meta-history.ts
 *   BASE_URL=https://maintenease.lovable.app tsx scripts/snapshot-meta-history.ts
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "https://maintenease.com";
const OUT_DIR = resolve(process.cwd(), "reports/meta-history");

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

const META_KEYS_PROPERTY = ["og:title", "og:description", "og:url", "og:image", "og:type"];
const META_KEYS_NAME = [
  "description",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

type PageSnapshot = {
  url: string;
  status: number;
  title: string | null;
  canonical: string | null;
  meta: Record<string, string | null>;
  jsonLd: unknown[];
};

type Snapshot = {
  takenAt: string;
  baseUrl: string;
  pages: Record<string, PageSnapshot>;
};

function extractMeta(html: string, attr: "property" | "name", key: string): string | null {
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
  return html.match(re2)?.[1] ?? null;
}

function extractTitle(html: string): string | null {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null;
}

function extractCanonical(html: string): string | null {
  return (
    html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null
  );
}

function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      out.push({ __parseError: true, raw: m[1].slice(0, 200) });
    }
  }
  return out;
}

async function snapshotPage(path: string): Promise<PageSnapshot> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const html = res.ok ? await res.text() : "";
  const meta: Record<string, string | null> = {};
  for (const k of META_KEYS_PROPERTY) meta[k] = extractMeta(html, "property", k);
  for (const k of META_KEYS_NAME) meta[k] = extractMeta(html, "name", k);
  return {
    url,
    status: res.status,
    title: extractTitle(html),
    canonical: extractCanonical(html),
    meta,
    jsonLd: extractJsonLd(html),
  };
}

function previousSnapshot(): Snapshot | null {
  if (!existsSync(OUT_DIR)) return null;
  const files = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".json") && f !== "latest.json")
    .sort();
  if (files.length === 0) return null;
  try {
    return JSON.parse(readFileSync(resolve(OUT_DIR, files[files.length - 1]), "utf8"));
  } catch {
    return null;
  }
}

function diffPage(prev: PageSnapshot | undefined, next: PageSnapshot): string[] {
  if (!prev) return ["(new page — no prior snapshot)"];
  const lines: string[] = [];
  const compare = (label: string, a: unknown, b: unknown) => {
    const aJ = JSON.stringify(a);
    const bJ = JSON.stringify(b);
    if (aJ !== bJ) lines.push(`- **${label}**\n  - before: \`${aJ}\`\n  - after:  \`${bJ}\``);
  };
  compare("title", prev.title, next.title);
  compare("canonical", prev.canonical, next.canonical);
  for (const k of Object.keys(next.meta)) compare(`meta[${k}]`, prev.meta[k], next.meta[k]);
  compare("jsonLd", prev.jsonLd, next.jsonLd);
  compare("http status", prev.status, next.status);
  return lines;
}

function renderDiff(prev: Snapshot | null, next: Snapshot): string {
  const head = [
    `# Meta-history diff`,
    ``,
    `- Base URL: ${next.baseUrl}`,
    `- This run: ${next.takenAt}`,
    `- Previous run: ${prev?.takenAt ?? "(none)"}`,
    ``,
  ];
  if (!prev) return head.concat(["_First snapshot — nothing to diff against._"]).join("\n");
  const body: string[] = [];
  let changed = 0;
  for (const path of Object.keys(next.pages)) {
    const lines = diffPage(prev.pages[path], next.pages[path]);
    if (lines.length > 0) {
      changed += 1;
      body.push(`## ${path}`, ...lines, "");
    }
  }
  if (changed === 0) body.push("_No changes._");
  else head.push(`**${changed} page(s) changed.**`, "");
  return head.concat(body).join("\n");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const takenAt = new Date().toISOString();
  const pages: Record<string, PageSnapshot> = {};
  await Promise.all(
    PATHS.map(async (p) => {
      pages[p] = await snapshotPage(p);
    }),
  );
  const snapshot: Snapshot = { takenAt, baseUrl: BASE_URL, pages };
  const prev = previousSnapshot();

  const filename = `${takenAt.replace(/[:.]/g, "-")}.json`;
  writeFileSync(resolve(OUT_DIR, filename), JSON.stringify(snapshot, null, 2));
  writeFileSync(resolve(OUT_DIR, "latest.json"), JSON.stringify(snapshot, null, 2));
  const diffMd = renderDiff(prev, snapshot);
  writeFileSync(resolve(OUT_DIR, "latest-diff.md"), diffMd);

  console.log(`Wrote ${filename}`);
  console.log(`Diff written to reports/meta-history/latest-diff.md`);
  if (prev) {
    const changed = Object.keys(snapshot.pages).filter(
      (p) => diffPage(prev.pages[p], snapshot.pages[p]).length > 0,
    ).length;
    console.log(`${changed} page(s) changed since previous snapshot.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});