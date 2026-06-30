// Auto-generates public/sitemap.xml from the canonical route list + dynamic data.
// Runs on predev and prebuild so every deploy ships an up-to-date sitemap.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { solutions } from "../src/data/solutions";
import { glossary } from "../src/data/glossary";
import { comparisons } from "../src/data/comparisons";

const BASE_URL = "https://maintenease.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/solutions", changefreq: "weekly", priority: "0.9" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/refund-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/sms-opt-in", changefreq: "yearly", priority: "0.2" },
];

const solutionEntries: SitemapEntry[] = solutions.map((s) => ({
  path: `/solutions/${s.slug}`,
  lastmod: today,
  changefreq: "monthly",
  priority: "0.8",
}));

const learnEntries: SitemapEntry[] = glossary.map((g) => ({
  path: `/learn/${g.slug}`,
  lastmod: today,
  changefreq: "monthly",
  priority: "0.7",
}));

const compareEntries: SitemapEntry[] = [
  { path: "/compare", lastmod: today, changefreq: "monthly", priority: "0.8" },
  ...comparisons.map((c) => ({
    path: `/compare/${c.slug}`,
    lastmod: today,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
];

const entries = [...staticEntries, ...solutionEntries, ...learnEntries, ...compareEntries];

function render(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

const outPath = resolve("public/sitemap.xml");
writeFileSync(outPath, render(entries));
console.log(`[sitemap] wrote ${entries.length} URLs → public/sitemap.xml`);