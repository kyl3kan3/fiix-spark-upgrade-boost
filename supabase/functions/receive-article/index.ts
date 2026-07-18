// AutoSEO webhook receiver. Verifies a shared bearer token and upserts the
// article into public.blog_posts. Uses the service role key to bypass RLS.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_ORIGIN = "https://maintenease.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function estimateReadingTime(html: string | null | undefined): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const expected = Deno.env.get("AUTOSEO_WEBHOOK_TOKEN") ?? "";
  if (!expected || token !== expected) return json(401, { error: "Unauthorized" });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const event = String(payload.event ?? "");
  if (event === "test") {
    return json(200, { url: `${SITE_ORIGIN}/blog/test`, status: "ok" });
  }

  try {
    const id = Number(payload.id);
    const slug = String(payload.slug ?? "");
    const title = String(payload.title ?? "");
    if (!id || !slug || !title) {
      return json(400, { error: "Missing required fields: id, slug, title" });
    }

    const contentHtml = (payload.content_html as string | null) ?? null;
    const readingTime = estimateReadingTime(contentHtml);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const row = {
      id,
      title,
      slug,
      content_html: contentHtml,
      content_markdown: (payload.content_markdown as string | null) ?? null,
      hero_image_url: (payload.heroImageUrl as string | null) ?? null,
      hero_image_alt: (payload.heroImageAlt as string | null) ?? null,
      infographic_url: (payload.infographicImageUrl as string | null) ?? null,
      meta_description: (payload.metaDescription as string | null) ?? null,
      meta_keywords: (payload.metaKeywords as string | null) ?? null,
      tags: (payload.wordpressTags as string | null) ?? null,
      faq_schema: (payload.faqSchema as unknown) ?? null,
      language: (payload.languageCode as string | null) ?? "en",
      reading_time: readingTime,
      published_at: (payload.publishedAt as string | null) ?? null,
      updated_at: (payload.updatedAt as string | null) ?? null,
      created_at: (payload.createdAt as string | null) ?? null,
      received_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("blog_posts")
      .upsert(row, { onConflict: "id" });

    if (error) return json(500, { error: error.message });

    return json(200, { url: `${SITE_ORIGIN}/blog/${slug}` });
  } catch (err) {
    return json(500, { error: err instanceof Error ? err.message : "Unknown error" });
  }
});