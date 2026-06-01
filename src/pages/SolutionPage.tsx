import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getSolution, solutions } from "@/data/solutions";
import MaterialIcon from "@/components/ui/material-icon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
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
    ctaBody: "Start a 14-day free trial — card required, cancel anytime before day 15. Or book a 20-minute call and we'll map your assets, PMs, and reports together.",
  },
};

const SolutionPage = () => {
  const { slug = "" } = useParams();
  const solution = getSolution(slug);
  const navigate = useNavigate();

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
  const lead = LEAD_FORM_COPY[solution.slug];
  const ctaHeadline = lead?.ctaHeadline ?? `Ready to see ${solution.name} in action?`;
  const ctaBody = lead?.ctaBody ?? "Start a 14-day free trial. Most teams have their first work orders running within an hour.";

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
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
      <MarketingJsonLd />
      <Navbar />

      <main className="flex-grow flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-container_padding py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="flex flex-col gap-6">
            <nav className="font-label-sm text-label-sm text-on-surface-variant">
              <Link to="/solutions" className="hover:text-primary transition-colors">Solutions</Link>
              <span className="mx-2">/</span>
              <span className="text-on-surface">{solution.name}</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full w-fit">
              <MaterialIcon name="precision_manufacturing" filled className="text-primary text-sm" />
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">{solution.name}</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background">{solution.h1}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{solution.tagline}</p>
            <div className="flex gap-4 pt-4">
              <button
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-4 rounded-lg hover:bg-primary-container transition-colors shadow-md hover:translate-y-[-2px] duration-200"
                onClick={() => navigate("/auth?signup=true")}
              >
                Request Demo
              </button>
              {LEAD_FORM_SLUGS.has(solution.slug) ? (
                <a
                  href="#talk-to-us"
                  className="text-primary font-label-md text-label-md px-6 py-4 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2"
                >
                  Talk to a Specialist <MaterialIcon name="arrow_forward" />
                </a>
              ) : (
                <Link
                  to="/pricing"
                  className="text-primary font-label-md text-label-md px-6 py-4 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2"
                >
                  View Pricing <MaterialIcon name="arrow_forward" />
                </Link>
              )}
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border border-outline-variant/20">
            <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
              <div className="text-center p-8">
                <MaterialIcon name="precision_manufacturing" className="text-primary text-[64px] mb-4" />
                <p className="font-headline-md text-headline-md text-on-surface">{solution.name}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">{solution.tagline}</p>
              </div>
            </div>
            {/* Floating Metric */}
            <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur-md p-4 rounded-lg shadow-md border border-outline-variant/20 flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-full flex items-center justify-center">
                <MaterialIcon name="trending_down" filled className="text-success" />
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-on-background font-bold">-20%</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Average Downtime Reduction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full bg-surface-container-low py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-container_padding">
            <h2 className="font-headline-lg text-headline-lg text-center mb-12">Precision Tools for Critical Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {solution.features.slice(0, 2).map((f, i) => (
                <div
                  key={f.title}
                  className={`${i === 0 ? "col-span-1 md:col-span-2" : "col-span-1"} bg-surface rounded-xl p-card_padding border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between min-h-[300px]`}
                >
                  <div>
                    <div className="bg-surface-container w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                      <MaterialIcon name={i === 0 ? "online_prediction" : "fact_check"} className="text-primary" />
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-3">{f.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{f.body}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                      {i === 0 ? "IoT Integration" : "Audit Ready"}
                    </span>
                    <MaterialIcon name="arrow_outward" className="text-outline-variant group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
              {solution.features.slice(2, 4).map((f, i) => (
                <div
                  key={f.title}
                  className={`${i === 1 ? "col-span-1 md:col-span-2" : "col-span-1"} bg-surface rounded-xl p-card_padding border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between min-h-[300px]`}
                >
                  <div>
                    <div className="bg-surface-container w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                      <MaterialIcon name={i === 0 ? "inventory_2" : "build"} filled={i === 0} className="text-primary" />
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-3">{f.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-container_padding">
            <h2 className="font-headline-lg text-headline-lg mb-10 text-on-background">Why teams switch to MaintenEase</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {solution.benefits.map((b) => (
                <div key={b.title} className="p-card_padding rounded-xl bg-surface border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">{b.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="w-full bg-surface-container-low py-16">
          <div className="max-w-3xl mx-auto px-container_padding">
            <h2 className="font-headline-lg text-headline-lg mb-8 text-on-background">Frequently asked questions</h2>
            <div className="space-y-4">
              {solution.faqs.map((f) => (
                <div key={f.q} className="p-card_padding rounded-xl border border-outline-variant/20 bg-surface shadow-sm">
                  <h3 className="font-label-md text-label-md font-bold text-on-surface mb-2">{f.q}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full max-w-7xl mx-auto px-container_padding py-16">
          <div className="p-10 rounded-2xl text-center bg-primary-container text-on-primary">
            <h2 className="font-display-lg text-headline-lg md:text-headline-lg font-bold mb-3">{ctaHeadline}</h2>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/85 mb-8 max-w-2xl mx-auto">{ctaBody}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                className="bg-on-primary-container text-primary-container px-8 py-4 rounded-lg font-label-md text-label-md uppercase tracking-wide shadow-md hover:-translate-y-0.5 transition-all"
                onClick={() => navigate("/auth?signup=true")}
              >
                Start Free Trial
              </button>
              {LEAD_FORM_SLUGS.has(solution.slug) && (
                <a
                  href="#talk-to-us"
                  className="bg-transparent text-on-primary border border-on-primary/30 hover:bg-on-primary/10 px-8 py-4 rounded-lg font-label-md text-label-md"
                >
                  Talk to a Specialist
                </a>
              )}
            </div>
          </div>
        </section>

        {LEAD_FORM_SLUGS.has(solution.slug) && (
          <section id="talk-to-us" className="w-full max-w-3xl mx-auto px-container_padding pb-20 scroll-mt-24">
            <LeadCaptureForm
              sourceSlug={solution.slug}
              title={LEAD_FORM_COPY[solution.slug].title}
              subtitle={LEAD_FORM_COPY[solution.slug].subtitle}
              cta={LEAD_FORM_COPY[solution.slug].cta}
            />
          </section>
        )}

        {/* Related solutions */}
        <section className="w-full max-w-7xl mx-auto px-container_padding pb-16">
          <h2 className="font-headline-lg text-headline-lg mb-6 text-on-background">Explore other solutions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((o) => (
              <Link
                key={o.slug}
                to={`/solutions/${o.slug}`}
                className="block p-card_padding rounded-xl border border-outline-variant/20 bg-surface hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <h3 className="font-label-md text-label-md font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{o.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{o.tagline}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start gap-3 border-t border-outline-variant/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Share this page</p>
            <ShareButtons url={url} title={solution.metaTitle} description={solution.tagline} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SolutionPage;
