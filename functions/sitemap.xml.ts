// Cloudflare Pages Function — dynamic /sitemap.xml.
// Overrides the static public/sitemap.xml so blog posts are always fresh.
// Combines the static marketing routes with rows from public.blog_posts.
import {
  STATIC_SITEMAP_ENTRIES,
  type SitemapEntry,
} from "../src/data/sitemapEntries";
import { redirectForPath } from "../src/lib/seoRouting";

const SITE = "https://maintenease.com";
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";

interface BlogRow {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderEntry(entry: SitemapEntry): string {
  return [
    "  <url>",
    `    <loc>${SITE}${entry.path}</loc>`,
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
    entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
    entry.priority ? `    <priority>${entry.priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (_context: any) => {
  let posts: BlogRow[] = [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,published_at&order=published_at.desc.nullslast&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
      },
    );
    if (res.ok) posts = (await res.json()) as BlogRow[];
  } catch {
    // Sitemap must still return static entries if the DB call fails.
  }

  const publishedPosts = posts.filter((post) => !redirectForPath(`/blog/${post.slug}`));
  const latestBlogLastmod = publishedPosts
    .map((post) => (post.updated_at ?? post.published_at ?? "").slice(0, 10))
    .filter(Boolean)
    .sort()
    .at(-1);
  const urls = STATIC_SITEMAP_ENTRIES.map((entry) =>
    renderEntry(entry.path === "/blog" ? { ...entry, lastmod: latestBlogLastmod } : entry),
  );

  for (const p of publishedPosts) {
    const lastmod = (p.updated_at ?? p.published_at ?? "").slice(0, 10);
    urls.push(
      `  <url>\n    <loc>${SITE}/blog/${esc(p.slug)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
};
