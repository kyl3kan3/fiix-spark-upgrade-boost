import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper } from "lucide-react";

const PAGE_SIZE = 12;
const META_DESCRIPTION =
  "Explore practical CMMS guides, preventive maintenance strategies, reliability benchmarks, and facility operations insights from the MaintenEase team.";

interface BlogPostCard {
  id: number;
  title: string;
  slug: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  meta_description: string | null;
  published_at: string | null;
  reading_time: number | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function truncate(text: string | null, n: number): string {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text;
}

const BlogIndex = () => {
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (from: number) => {
    const { data, error: err } = await supabase
      .from("blog_posts" as never)
      .select("id,title,slug,hero_image_url,hero_image_alt,meta_description,published_at,reading_time")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (err) throw err;
    return (data ?? []) as unknown as BlogPostCard[];
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await fetchPage(0);
      setPosts(first);
      setHasMore(first.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchPage(posts.length);
      setPosts((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <MarketingLayout>
      <Helmet>
        <title>MaintenEase Blog — Maintenance & CMMS Insights</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href="https://maintenease.com/blog" />
        <meta property="og:title" content="Blog | MaintenEase" />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content="https://maintenease.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | MaintenEase" />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      </Helmet>

      <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <p className="text-sm font-medium text-primary mb-3">Blog</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-normal mb-4">Insights & articles</h1>
        <p className="text-lg text-foreground max-w-3xl mb-12">
          Guides, best practices, and product updates from the MaintenEase team.
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-foreground mb-4">Couldn't load articles. Please try again.</p>
            <Button onClick={() => void load()}>Retry</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Newspaper className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Articles are on the way!</h2>
            <p className="text-muted-foreground">Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button onClick={() => void loadMore()} disabled={loadingMore} variant="outline">
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}

        <section
          aria-labelledby="blog-guide-heading"
          className="mt-16 border-t border-border pt-12"
        >
          <div className="max-w-3xl">
            <h2 id="blog-guide-heading" className="text-2xl md:text-3xl font-semibold mb-4">
              Practical guidance for maintenance teams
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MaintenEase articles turn maintenance concepts into steps your team can use on the
              floor. Learn how to plan preventive work, organize incoming requests, build useful
              asset histories, and choose metrics that reveal whether reliability is improving.
              Each guide is written for the people who schedule, perform, and approve maintenance
              work—not just software specialists.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              You will also find clear explanations of CMMS terminology, equipment reliability
              benchmarks, and practical ways to reduce reactive work. Whether you manage one
              facility or a growing portfolio, the goal is the same: make priorities visible,
              capture what technicians know, and prevent avoidable downtime without adding
              unnecessary administrative work.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-5">
              <h3 className="font-semibold mb-2">Plan the right work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build preventive schedules and work-order processes that match real equipment risk.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-5">
              <h3 className="font-semibold mb-2">Measure reliability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use MTBF, MTTR, cost, and backlog data to spot recurring failures and bottlenecks.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-5">
              <h3 className="font-semibold mb-2">Improve adoption</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Give technicians a simpler system for recording work and sharing field knowledge.
              </p>
            </div>
          </div>
        </section>
      </section>
    </MarketingLayout>
  );
};

const BlogCard = ({ post }: { post: BlogPostCard }) => {
  const [hideImage, setHideImage] = useState(!post.hero_image_url);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
    >
      {!hideImage && post.hero_image_url && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={post.hero_image_url}
            alt={post.hero_image_alt ?? post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setHideImage(true)}
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.meta_description && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {truncate(post.meta_description, 160)}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.published_at && post.reading_time && <span>·</span>}
          {post.reading_time && <span>{post.reading_time} min read</span>}
        </div>
      </div>
    </Link>
  );
};

export default BlogIndex;
