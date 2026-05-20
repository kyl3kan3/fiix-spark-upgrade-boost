
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import RequestPortalSection from "@/components/RequestPortalSection";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SiteIndexLinks from "@/components/SiteIndexLinks";
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>MaintenEase — Maintenance Management Software</title>
        <meta name="description" content="MaintenEase helps maintenance teams organize assets, schedule work orders, run inspections, and optimize operations from one modern platform." />
        <link rel="canonical" href="https://maintenease.com/" />
        <meta property="og:title" content="MaintenEase — Maintenance Management Software" />
        <meta property="og:description" content="Organize assets, schedule work orders, and run inspections from one modern maintenance platform." />
        <meta property="og:url" content="https://maintenease.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase — Maintenance Management Software" />
        <meta name="twitter:description" content="Organize assets, schedule work orders, and run inspections from one modern maintenance platform." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
      </Helmet>
      <MarketingJsonLd />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <RequestPortalSection />
        <Testimonials />
        <CTA />
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Found this useful?</h2>
              <p className="text-sm text-gray-600">Share MaintenEase with your team or network.</p>
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
};

export default Index;
