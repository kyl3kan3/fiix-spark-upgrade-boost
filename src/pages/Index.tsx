import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSolved from "@/components/ProblemSolved";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import HomeExploreSection from "@/components/HomeExploreSection";
import HomePricingSummary from "@/components/HomePricingSummary";
import TrustBadges from "@/components/TrustBadges";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { HOME_FAQS, buildHomeFaqPageJsonLd } from "@/data/homeFaqs";

const Index = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Helmet>
      <title>MaintenEase — CMMS Software to Prevent Downtime</title>
      <meta
        name="description"
        content="CMMS for facility and maintenance teams. Track work orders, assets, inspections, and equipment risk with account plans from $49/month."
      />
      <link rel="canonical" href="https://maintenease.com/" />
      <meta property="og:title" content="MaintenEase — CMMS Software to Prevent Downtime" />
      <meta
        property="og:description"
        content="Track work orders, assets, and inspections, with predictive maintenance on eligible plans and account pricing from $49/month."
      />
      <meta property="og:url" content="https://maintenease.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="MaintenEase — CMMS Software to Prevent Downtime" />
      <meta
        name="twitter:description"
        content="Track work orders, assets, and inspections, with predictive maintenance on eligible plans and account pricing from $49/month."
      />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
      <script type="application/ld+json" data-rh="true">
        {JSON.stringify(buildHomeFaqPageJsonLd())}
      </script>
    </Helmet>
    <MarketingJsonLd />
    <Navbar />
    <main className="flex-1">
      <Hero />
      <ProblemSolved />
      <Features variant="home" homeFeatureLimit={6} />
      <TrustBadges />
      <HomePricingSummary />
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="w-full divide-y divide-border border-y border-border">
            {HOME_FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-foreground marker:content-none">
                  {f.q}
                  <span aria-hidden="true" className="text-xl font-normal text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CTA />
      <HomeExploreSection />
    </main>
    <Footer />
  </div>
);

export default Index;
