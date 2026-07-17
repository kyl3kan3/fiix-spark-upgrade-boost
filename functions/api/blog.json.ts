// Cloudflare Pages Function — structured index of published blog posts
// for AI agents. Mirrors the shape of /api/ai.json.
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";
const SITE = "https://maintenease.com";

interface Row {
  slug: string;
  title: string;
  meta_description: string | null;
  tags: string[] | null;
  reading_time: number | null;
  hero_image_url: string | null;
  published_at: string | null;
  updated_at: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (_context: any) => {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,meta_description,tags,reading_time,hero_image_url,published_at,updated_at&order=published_at.desc.nullslast&limit=5000`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  });
  const rows: Row[] = res.ok ? await res.json() : [];

  const body = {
    site: SITE,
    generated_at: new Date().toISOString(),
    count: rows.length,
    posts: rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      description: r.meta_description,
      tags: r.tags ?? [],
      reading_time_min: r.reading_time,
      hero_image_url: r.hero_image_url,
      published_at: r.published_at,
      updated_at: r.updated_at,
      html_url: `${SITE}/blog/${r.slug}`,
      markdown_url: `${SITE}/blog/${r.slug}.md`,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=600",
    },
  });
};