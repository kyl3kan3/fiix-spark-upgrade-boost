// Auto-generates public/sitemap.xml from the canonical route list + dynamic data.
// Runs on predev and prebuild so every deploy ships an up-to-date sitemap.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { solutions } from "../src/data/solutions";
import { glossary } from "../src/data/glossary";
import { comparisons } from "../src/data/comparisons";

const BASE_URL = "https://maintenease.com";
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";

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
  { path: "/features", changefreq: "monthly", priority: "0.8" },
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
  { path: "/cmms-cost-calculator", lastmod: today, changefreq: "monthly", priority: "0.8" },
  ...comparisons.map((c) => ({
    path: `/compare/${c.slug}`,
    lastmod: today,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
];

async function fetchBlogEntries(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,published_at&order=published_at.desc.nullslast&limit=5000`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
    );
    if (!res.ok) {
      console.warn(`[sitemap] blog fetch failed: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as Array<{
      slug: string;
      updated_at: string | null;
      published_at: string | null;
    }>;
    return rows.map((r) => ({
      path: `/blog/${r.slug}`,
      lastmod: (r.updated_at ?? r.published_at ?? today).slice(0, 10),
      changefreq: "weekly" as const,
      priority: "0.7",
    }));
  } catch (err) {
    console.warn(`[sitemap] blog fetch error: ${(err as Error).message}`);
    return [];
  }
}

const blogEntries = await fetchBlogEntries();
const blogIndexEntry: SitemapEntry = {
  path: "/blog",
  lastmod: today,
  changefreq: "daily",
  priority: "0.8",
};

const entries = [
  ...staticEntries,
  blogIndexEntry,
  ...solutionEntries,
  ...learnEntries,
  ...compareEntries,
  ...blogEntries,
];

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