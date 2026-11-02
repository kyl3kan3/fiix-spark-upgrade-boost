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
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";

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
    </Helmet>
    <MarketingJsonLd />
    <Navbar />
    <main className="flex-1">
      <Hero />
      <ProblemSolved />
      <Features variant="home" />
      <LocalBusinesses />
      <TrustBadges />
      <RequestPortalSection />
      <Testimonials />
      <WhyDifferent />
      <FlatFeeAdvantage />
      <Pricing />
      <CTA />
      <SiteIndexLinks />
    </main>
    <Footer />
  </div>
);

export default Index;
