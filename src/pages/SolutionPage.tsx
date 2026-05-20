import { Helmet } from "react-helmet";
import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getSolution, solutions } from "@/data/solutions";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import ShareButtons from "@/components/marketing/ShareButtons";
import { buildPageViewDedupeKey, isTrackedMarketingSlug, trackMarketingEvent } from "@/lib/analytics/marketingEvents";

const LEAD_FORM_SLUGS = new Set(["asset-tracking-software", "asset-management-software"]);

const LEAD_FORM_COPY: Record<string, { title: string; subtitle: string; cta: string; ctaHeadline: string; ctaBody: string }> = {
  "asset-tracking-software": {
    title: "See your asset register on a map and a QR scan",
    subtitle: "Tell us how many assets you track and we'll show you the fastest way to get every one labelled, located, and live in MaintenEase.",
    cta: "Book a 20-min walkthrough",
    ctaHeadline: "Stop hunting for assets. Start scanning them.",
    ctaBody: "Most teams have their first 100 assets QR-labelled and live within a day. Start free, or book a walkthrough with a specialist.",
  },
  "asset-management-software": {
    title: "Talk to an asset management specialist",
    subtitle: "Send us the rough shape of your asset register and we'll show you how MaintenEase would handle PMs, warranties, and lifecycle reporting on day one.",
    cta: "Book a tailored demo",
    ctaHeadline: "Turn your asset register into a system of record.",
    ctaBody: "Free trial, no credit card. Or book a 20-minute call and we'll map your assets, PMs, and reports together.",
  },
};

const SolutionPage = () => {
  const { slug = "" } = useParams();
  const solution = getSolution(slug);

  useEffect(() => {
    if (!solution || !isTrackedMarketingSlug(solution.slug)) return;
    const dedupeKey = buildPageViewDedupeKey(solution.slug);
    void trackMarketingEvent({
      eventType: "page_view",
      pageSlug: solution.slug,
      ...(dedupeKey ? { dedupeKey } : {}),
    });
  }, [solution]);

  if (!solution) return <Navigate to="/solutions" replace />;

  const url = `https://maintenease.com/solutions/${solution.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Solutions", item: "https://maintenease.com/solutions" },
      { "@type": "ListItem", position: 2, name: solution.name, item: url },
    ],
  };

  const others = solutions.filter((s) => s.slug !== solution.slug);

  return (
    <MarketingLayout>
      <Helmet>
        <title>{solution.metaTitle}</title>
        <meta name="description" content={solution.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={solution.metaTitle} />
        <meta property="og:description" content={solution.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={solution.metaTitle} />
        <meta name="twitter:description" content={solution.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <section className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/solutions" className="hover:text-maintenease-600">Solutions</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{solution.name}</span>
        </nav>
        <p className="text-sm font-medium text-maintenease-600 mb-3">{solution.name}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">{solution.h1}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-8">{solution.tagline}</p>
        <div className="flex flex-wrap gap-3 mb-12">
          <Button asChild size="lg"><Link to="/auth?signup=true">Start free</Link></Button>
          {LEAD_FORM_SLUGS.has(solution.slug) ? (
            <Button asChild size="lg" variant="outline"><a href="#talk-to-us">Talk to a specialist</a></Button>
          ) : (
            <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
          )}
        </div>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">{solution.intro}</p>
      </section>

      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold mb-10">Why teams switch to MaintenEase</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {solution.benefits.map((b) => (
              <div key={b.title} className="p-6 rounded-lg bg-white border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{b.title}</h3>
                <p className="text-gray-700">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-3xl font-bold mb-10">What's included</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {solution.features.map((f) => (
            <div key={f.title} className="p-6 rounded-lg border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{f.title}</h3>
              <p className="text-gray-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold mb-8">Built for teams like these</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {solution.useCases.map((u) => (
              <li key={u} className="flex gap-3 items-start text-gray-700">
                <Check className="h-5 w-5 text-maintenease-600 mt-0.5 shrink-0" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="text-3xl font-bold mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {solution.faqs.map((f) => (
            <div key={f.q} className="p-5 rounded-lg border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
              <p className="text-gray-700">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {(() => {
        const lead = LEAD_FORM_COPY[solution.slug];
        const headline = lead?.ctaHeadline ?? `Ready to see ${solution.name} in action?`;
        const body = lead?.ctaBody ?? "Start free — no credit card required. Most teams have their first work orders running within an hour.";
        return (
          <section className="container mx-auto px-4 pb-20 max-w-5xl">
            <div className="p-10 rounded-2xl bg-maintenease-600 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{headline}</h2>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">{body}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth?signup=true">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                {LEAD_FORM_SLUGS.has(solution.slug) && (
                  <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">
                    <a href="#talk-to-us">Talk to a specialist</a>
                  </Button>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {LEAD_FORM_SLUGS.has(solution.slug) && (
        <section id="talk-to-us" className="container mx-auto px-4 pb-20 max-w-3xl scroll-mt-24">
          <LeadCaptureForm
            sourceSlug={solution.slug}
            title={LEAD_FORM_COPY[solution.slug].title}
            subtitle={LEAD_FORM_COPY[solution.slug].subtitle}
            cta={LEAD_FORM_COPY[solution.slug].cta}
          />
        </section>
      )}

      <section className="container mx-auto px-4 pb-16 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">Explore other solutions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {others.map((o) => (
            <Link
              key={o.slug}
              to={`/solutions/${o.slug}`}
              className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-maintenease-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{o.name}</h3>
              <p className="text-sm text-gray-600">{o.tagline}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">Share this page</p>
          <ShareButtons url={url} title={solution.metaTitle} description={solution.tagline} />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default SolutionPage;