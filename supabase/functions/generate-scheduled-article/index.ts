// Scheduled article generator. Uses Lovable AI Gateway to draft a blog post
// from a rotating list of topics, then inserts it into public.blog_posts.
// Triggered by pg_cron (or manual POST with the shared token).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_ORIGIN = "https://maintenease.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPICS = [
  "How to reduce equipment downtime with preventive maintenance",
  "MTBF vs MTTR: what facility managers should track",
  "Choosing a CMMS: 10 questions to ask before buying",
  "The true cost of reactive maintenance",
  "Building a preventive maintenance schedule that techs actually follow",
  "Work order workflows that reduce handoff time",
  "Condition-based maintenance for small facilities teams",
  "How to onboard technicians to a new CMMS in one week",
  "Asset lifecycle management fundamentals",
  "Spare parts inventory: right-sizing without stockouts",
  "KPIs every maintenance manager should review weekly",
  "Predictive maintenance without expensive sensors",
];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // Auth: allow either the AUTOSEO shared token (reused for internal triggers)
  // or the service role key (used by pg_cron via net.http_post).
  const auth = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const expected = Deno.env.get("AUTOSEO_WEBHOOK_TOKEN") ?? "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!auth || (auth !== expected && auth !== service)) {
    return json(401, { error: "Unauthorized" });
  }

  let topic: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    topic = typeof body?.topic === "string" && body.topic.trim()
      ? body.topic.trim()
      : TOPICS[Math.floor(Math.random() * TOPICS.length)];
  } catch {
    topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) return json(500, { error: "LOVABLE_API_KEY not configured" });

  const prompt = `You are an SEO editor for MaintenEase, a CMMS for small facilities teams.
Write a blog article on: "${topic}".

Return STRICT JSON with keys:
- title (string, <=65 chars, keyword-rich)
- slug (string, kebab-case, <=60 chars)
- meta_description (string, 140-158 chars)
- meta_keywords (comma-separated string)
- tags (comma-separated string, 3-6 tags)
- content_html (string; 800-1200 words; use <h2>, <h3>, <p>, <ul>, <li>; no <html>/<body>; include 2-3 internal links to /learn, /features, or /cmms-cost-calculator when relevant)
- content_markdown (string; same content in Markdown)

No commentary, no code fences. JSON only.`;

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You write concise, factual SEO content in strict JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    const text = await aiRes.text();
    return json(aiRes.status, { error: "AI generation failed", details: text });
  }

  const aiJson = await aiRes.json();
  const raw = aiJson?.choices?.[0]?.message?.content ?? "";
  let article: Record<string, unknown>;
  try {
    article = JSON.parse(stripFences(String(raw)));
  } catch {
    return json(502, { error: "AI returned invalid JSON", raw });
  }

  const title = String(article.title ?? topic).slice(0, 120);
  const slug = slugify(String(article.slug ?? title));
  const content_html = String(article.content_html ?? "");
  if (!content_html) return json(502, { error: "AI returned empty content" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    service,
    { auth: { persistSession: false } },
  );

  // Ensure slug is unique by appending a date suffix if needed.
  let finalSlug = slug;
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", finalSlug)
    .maybeSingle();
  if (existing) {
    finalSlug = `${slug}-${new Date().toISOString().slice(0, 10)}`;
  }

  // Pick a unique numeric id (blog_posts.id is set by webhook to remote id;
  // for internal drafts we use epoch-seconds to stay unique and out of the way).
  const id = Math.floor(Date.now() / 1000);
  const now = new Date().toISOString();

  const row = {
    id,
    title,
    slug: finalSlug,
    content_html,
    content_markdown: (article.content_markdown as string | null) ?? null,
    hero_image_url: null,
    hero_image_alt: null,
    infographic_url: null,
    meta_description: (article.meta_description as string | null) ?? null,
    meta_keywords: (article.meta_keywords as string | null) ?? null,
    tags: (article.tags as string | null) ?? null,
    faq_schema: null,
    language: "en",
    reading_time: estimateReadingTime(content_html),
    published_at: now,
    updated_at: now,
    created_at: now,
    received_at: now,
  };

  const { error } = await supabase.from("blog_posts").insert(row);
  if (error) return json(500, { error: error.message });

  return json(200, { url: `${SITE_ORIGIN}/blog/${finalSlug}`, id, topic });
});