import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSolved from "@/components/ProblemSolved";
import Features from "@/components/Features";
import LocalBusinesses from "@/components/LocalBusinesses";
import WhyDifferent from "@/components/WhyDifferent";
import RequestPortalSection from "@/components/RequestPortalSection";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FlatFeeAdvantage from "@/components/FlatFeeAdvantage";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SiteIndexLinks from "@/components/SiteIndexLinks";
import TrustBadges from "@/components/TrustBadges";
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { SOFTWARE_APPLICATION_JSON_LD } from "@/data/productCatalog";

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
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="MaintenEase — CMMS Software to Prevent Downtime" />
      <meta
        name="twitter:description"
        content="Track work orders, assets, and inspections, with predictive maintenance on eligible plans and account pricing from $49/month."
      />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      <script type="application/ld+json">{JSON.stringify(SOFTWARE_APPLICATION_JSON_LD)}</script>
    </Helmet>
    <MarketingJsonLd />
    <Navbar />
    <main className="flex-1">
      <div className="container mx-auto max-w-5xl px-4 pb-2 pt-28 text-center md:pt-32">
        <h1 className="text-balance font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          CMMS Software for Facility &amp; Maintenance Teams
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Track work orders, assets, and inspections in one place, with predictive maintenance on eligible plans and
          account pricing starting at $49/month.
        </p>
      </div>
      <Hero />
      <ProblemSolved />
      <Features />
      <LocalBusinesses />
      <TrustBadges />
      <RequestPortalSection />
      <Testimonials />
      <WhyDifferent />
      <FlatFeeAdvantage />
      <Pricing />
      <CTA />
      <section className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Found this useful?</h2>
            <p className="text-sm text-foreground">Share MaintenEase with your team or network.</p>
          </div>
          <ShareButtons
            url="https://maintenease.com/"
            title="MaintenEase — Maintenance Management Software"
            description="Organize assets, schedule work orders, and run inspections from one modern platform."
          />
        </div>
      </section>
      <SiteIndexLinks />
    </main>
    <Footer />
  </div>
);

export default Index;
