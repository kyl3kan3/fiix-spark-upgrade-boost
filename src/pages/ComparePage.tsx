import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import ShareButtons from "@/components/marketing/ShareButtons";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { getComparison, comparisons, type CompareValue } from "@/data/comparisons";

const Cell = ({ value, accent }: { value: CompareValue; accent?: boolean }) => {
  if (value === true) return <Check className={`h-5 w-5 ${accent ? "text-primary" : "text-success"}`} aria-label="Yes" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground" aria-label="No" />;
  return <span className={`text-sm ${accent ? "font-semibold text-primary" : "text-foreground"}`}>{value}</span>;
};

const ComparePage = () => {
  const { slug = "" } = useParams();
  const c = getComparison(slug);
  if (!c) return <Navigate to="/compare" replace />;

  const url = `https://maintenease.com/compare/${c.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Compare", item: "https://maintenease.com/compare" },
      { "@type": "ListItem", position: 2, name: c.h1, item: url },
    ],
  };

  const others = comparisons.filter((o) => o.slug !== c.slug);

  return (
    <MarketingLayout>
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={c.metaTitle} />
        <meta name="twitter:description" content={c.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=3" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <MarketingJsonLd />

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/compare" className="hover:text-primary transition-colors">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{c.h1}</span>
        </nav>
        <p className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wide">CMMS comparison</p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-normal mb-4 max-w-3xl text-foreground">{c.h1}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mb-8 leading-relaxed">{c.tagline}</p>
        <div className="flex flex-wrap gap-3 mb-12">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold shadow-md hover:-translate-y-0.5 transition-ui">
            <Link to="/auth?signup=true">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{c.intro}</p>
      </section>

      {/* Comparison table */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-headline text-3xl font-bold mb-8 text-foreground">
            MaintenEase vs {c.competitor}, side by side
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="grid grid-cols-[1.4fr_1fr_1fr] text-sm">
              <div className="bg-muted px-4 py-3 font-semibold text-foreground border-b border-border">Feature</div>
              <div className="bg-primary/5 px-4 py-3 font-semibold text-primary border-b border-border text-center">MaintenEase</div>
              <div className="bg-muted px-4 py-3 font-semibold text-foreground border-b border-border text-center">
                {c.competitor}
                <span className="block text-xs font-normal text-muted-foreground">{c.competitorPlan}</span>
              </div>
              {c.rows.map((row) => (
                <div key={row.feature} className="contents">
                  <div className={`px-4 py-3 border-b border-border last:border-b-0 text-foreground ${row.highlight ? "font-semibold" : ""}`}>
                    {row.feature}
                  </div>
                  <div className="px-4 py-3 border-b border-border last:border-b-0 bg-primary/5 flex items-center justify-center text-center">
                    <Cell value={row.ours} accent={row.highlight} />
                  </div>
                  <div className="px-4 py-3 border-b border-border last:border-b-0 flex items-center justify-center text-center text-muted-foreground">
                    <Cell value={row.theirs} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-muted/50 text-xs text-muted-foreground border-t border-border">
              {c.competitor} pricing reflects its publicly listed {c.competitorPlan} tier (~${c.competitorPricePerUser}/user/mo) as of 2026
              and is shown for comparison only. MaintenEase is not affiliated with {c.competitor}; verify current details on the vendor's site.
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="font-headline text-3xl font-bold mb-10 text-foreground">Why teams pick MaintenEase</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {c.differentiators.map((d) => (
            <div key={d.title} className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-ui">
              <h3 className="text-lg font-semibold mb-2 text-foreground">{d.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-3xl font-bold mb-8 text-foreground">Frequently asked questions</h2>
          <div className="space-y-4">
            {c.faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="p-10 rounded-2xl text-center text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }}>
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-3">See the difference for your crew</h2>
          <p className="text-lg text-primary-foreground/85 mb-8 max-w-2xl mx-auto">
            Start a 7-day free trial and bring your whole team on for one flat price.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 font-semibold uppercase tracking-wide shadow-md">
              <Link to="/auth?signup=true">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related comparisons */}
      <section className="container mx-auto px-4 pb-16 max-w-5xl">
        <h2 className="font-headline text-2xl font-semibold mb-6 text-foreground">Other comparisons</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {others.map((o) => (
            <Link
              key={o.slug}
              to={`/compare/${o.slug}`}
              className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-ui group"
            >
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{o.h1}</h3>
              <p className="text-sm text-muted-foreground">{o.tagline}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Share this comparison</p>
          <ShareButtons url={url} title={c.metaTitle} description={c.tagline} />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ComparePage;
