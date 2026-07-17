// Cloudflare Pages Function — serves a single published blog post as
// clean Markdown for AI crawlers (ChatGPT, Claude, Gemini, etc.).
// URL shape: /blog/<slug>.md
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";
const SITE = "https://maintenease.com";

interface BlogRow {
  slug: string;
  title: string;
  meta_description: string | null;
  content_markdown: string | null;
  content_html: string | null;
  tags: string[] | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  published_at: string | null;
  updated_at: string | null;
  reading_time: number | null;
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<\/(p|div|ul|ol|section)>/gi, "\n\n")
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet = async (context: any) => {
  const slug = String(context.params?.slug ?? "").replace(/\.md$/i, "");
  if (!slug) return new Response("Not found", { status: 404 });

  const url = `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(
    slug,
  )}&select=slug,title,meta_description,content_markdown,content_html,tags,hero_image_url,hero_image_alt,published_at,updated_at,reading_time&limit=1`;

  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  });
  if (!res.ok) return new Response("Upstream error", { status: 502 });
  const rows = (await res.json()) as BlogRow[];
  const post = rows[0];
  if (!post) return new Response("Not found", { status: 404 });

  const body = post.content_markdown?.trim()
    ? post.content_markdown.trim()
    : htmlToMarkdown(post.content_html ?? "");

  const md = [
    `# ${post.title}`,
    "",
    post.meta_description ? `> ${post.meta_description}` : null,
    "",
    `Canonical URL: ${SITE}/blog/${post.slug}`,
    post.published_at ? `Published: ${post.published_at.slice(0, 10)}` : null,
    post.updated_at ? `Updated: ${post.updated_at.slice(0, 10)}` : null,
    post.reading_time ? `Reading time: ${post.reading_time} min` : null,
    post.tags?.length ? `Tags: ${post.tags.join(", ")}` : null,
    "",
    post.hero_image_url
      ? `![${post.hero_image_alt ?? post.title}](${post.hero_image_url})`
      : null,
    "",
    body,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return new Response(md + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=600",
    },
  });
};