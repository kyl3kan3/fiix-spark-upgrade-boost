
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
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";

const Index = () => {
 return (
 <div className="min-h-screen flex flex-col bg-background text-foreground">
 <Helmet>
 <title>MaintenEase — CMMS Software to Prevent Downtime</title>
 <meta name="description" content="CMMS for facility & maintenance teams. Track work orders, assets & inspections, and prevent downtime with predictive AI. Flat pricing from $49/mo." />
 <link rel="canonical" href="https://maintenease.com/" />
 <meta property="og:title" content="MaintenEase — CMMS Software to Prevent Downtime" />
 <meta property="og:description" content="CMMS for facility & maintenance teams. Track work orders, assets & inspections, and prevent downtime with predictive AI. Flat pricing from $49/mo." />
 <meta property="og:url" content="https://maintenease.com/" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="MaintenEase — CMMS Software to Prevent Downtime" />
 <meta name="twitter:description" content="CMMS for facility & maintenance teams. Track work orders, assets & inspections, and prevent downtime with predictive AI. Flat pricing from $49/mo." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
 </Helmet>
 <MarketingJsonLd />
 <Navbar />
 <main className="flex-1">
 <div className="container mx-auto px-4 pt-10 pb-2 max-w-5xl text-center">
 <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
 CMMS Software for Facility & Maintenance Teams
 </h1>
 <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
 Track work orders, assets, and inspections in one place, and prevent downtime with predictive maintenance — flat pricing starting at $49/mo.
 </p>
 </div>
 <Hero />
 <ProblemSolved />
 <Features />
 <LocalBusinesses />
 <RequestPortalSection />
 <Testimonials />
 <WhyDifferent />
 <FlatFeeAdvantage />
 <Pricing />
 <CTA />
 <section className="container mx-auto px-4 py-10 max-w-5xl">
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
      <section className="container mx-auto px-4 pb-10 flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href="https://verifieddr.com/website/maintenease-com" target="_blank"><img src="https://verifieddr.com/badge/maintenease-com.svg?metric=truedr" alt="Verified DR - Verified Domain Rating for maintenease.com" width="220" height="68" /></a>
        <a href="https://startupbase.io/products/maintenease?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light" target="_blank" rel="noopener noreferrer">
          <img src="https://statics.startupbase.io/site/badges/launched-on-sb.svg" alt="Launched on StartupBase" height="55" style={{ height: '55px', width: 'auto' }} />
        </a>
      </section>
      <SiteIndexLinks />
      </main>
 <Footer />
 </div>
 );
};

export default Index;
