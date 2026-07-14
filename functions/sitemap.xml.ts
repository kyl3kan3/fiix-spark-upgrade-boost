// Cloudflare Pages Function — dynamic /sitemap.xml.
// Overrides the static public/sitemap.xml so blog posts are always fresh.
// Combines the static marketing routes with rows from public.blog_posts.
const SITE = "https://maintenease.com";
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";

interface BlogRow {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
}

const STATIC_ENTRIES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/features", priority: "0.8", changefreq: "monthly" },
  { path: "/solutions", priority: "0.9", changefreq: "weekly" },
  { path: "/learn", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  const urls: string[] = [];
  for (const e of STATIC_ENTRIES) {
    urls.push(
      `  <url>\n    <loc>${SITE}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    );
  }
  for (const p of posts) {
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