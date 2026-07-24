import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogPostRow {
  id: number;
  title: string;
  slug: string;
  content_html: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  infographic_url: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  faq_schema: FaqItem[] | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string | null;
}

interface RelatedPost {
  id: number;
  slug: string;
  title: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  published_at: string | null;
}

const SITE = "https://maintenease.com";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Hide broken content images after the article HTML renders.
function useHideBrokenImages(html: string | null) {
  useEffect(() => {
    const container = document.getElementById("blog-content");
    if (!container) return;
    container.querySelectorAll("img").forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.addEventListener("error", () => {
        img.style.display = "none";
      });
    });
  }, [html]);
}

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPostRow | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hideHero, setHideHero] = useState(false);
  const [hideInfographic, setHideInfographic] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setHideHero(false);
    setHideInfographic(false);
    const { data, error } = await supabase
      .from("blog_posts" as never)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) {
      setNotFound(true);
      setPost(null);
      setLoading(false);
      return;
    }
    const row = data as unknown as BlogPostRow;
    setPost(row);

    const { data: rel } = await supabase
      .from("blog_posts" as never)
      .select("id,slug,title,hero_image_url,hero_image_alt,published_at")
      .neq("id", row.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);
    setRelated((rel ?? []) as unknown as RelatedPost[]);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useHideBrokenImages(post?.content_html ?? null);

  const faqs = useMemo<FaqItem[]>(() => {
    const raw = post?.faq_schema;
    if (!Array.isArray(raw)) return [];
    return raw.filter((f): f is FaqItem => Boolean(f?.question && f?.answer));
  }, [post]);

  if (loading) {
    return (
      <MarketingLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </MarketingLayout>
    );
  }

  if (notFound || !post) {
    return (
      <MarketingLayout>
        <Helmet>
          <title>Article not found | MaintenEase</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="container mx-auto px-4 py-24 max-w-xl text-center">
          <h1 className="text-3xl font-bold mb-3">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">Back to all articles</Link>
          </Button>
        </div>
      </MarketingLayout>
    );
  }

  const url = `${SITE}/blog/${post.slug}`;
  const description =
    post.meta_description ??
    (post.content_html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: post.hero_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: "MaintenEase",
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
    },
  };

  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <MarketingLayout>
      <Helmet>
        <title>{post.title} | MaintenEase</title>
        <meta name="description" content={description} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>

      <article className="container mx-auto px-4 py-10 md:py-14 max-w-[720px]">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all articles
        </Link>

        {post.hero_image_url && !hideHero && (
          <div className="mb-8 rounded-xl overflow-hidden bg-muted">
            <img
              src={post.hero_image_url}
              alt={post.hero_image_alt ?? post.title}
              className="w-full max-h-[400px] object-cover"
              onError={() => setHideHero(true)}
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-normal mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-8">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.published_at && post.reading_time && <span>·</span>}
          {post.reading_time && <span>{post.reading_time} min read</span>}
        </div>

        <div
          id="blog-content"
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.content_html ?? "" }}
        />

        {post.infographic_url && !hideInfographic && (
          <div className="mt-10 rounded-xl border border-border overflow-hidden">
            <img
              src={post.infographic_url}
              alt={`${post.title} infographic`}
              className="w-full h-auto"
              onError={() => setHideInfographic(true)}
            />
          </div>
        )}

        {faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left cursor-pointer">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-foreground leading-relaxed">{f.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-semibold mb-4">Keep reading</h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                >
                  {r.hero_image_url && (
                    <img
                      src={r.hero_image_url}
                      alt={r.hero_image_alt ?? r.title}
                      className="h-16 w-24 object-cover rounded-md shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{r.title}</div>
                    {r.published_at && (
                      <div className="text-xs text-muted-foreground">{formatDate(r.published_at)}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </MarketingLayout>
  );
};

export default BlogPost;
