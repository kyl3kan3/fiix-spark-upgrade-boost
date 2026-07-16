
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
 <title>MaintenEase — CMMS & Maintenance Management Software</title>
 <meta name="description" content="Modern CMMS that helps facility & maintenance teams track work orders, assets, and inspections. Prevent downtime with predictive AI. From $49/mo, flat pricing." />
 <link rel="canonical" href="https://maintenease.com/" />
 <meta property="og:title" content="MaintenEase — CMMS & Maintenance Management Software" />
 <meta property="og:description" content="Modern CMMS for facility & maintenance teams. Track work orders, assets, and inspections. Predict failures. Flat pricing from $49/mo." />
 <meta property="og:url" content="https://maintenease.com/" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="MaintenEase — CMMS & Maintenance Management Software" />
 <meta name="twitter:description" content="Modern CMMS for facility & maintenance teams. Track work orders, assets, and inspections. Predict failures. Flat pricing from $49/mo." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
 </Helmet>
 <MarketingJsonLd />
 <Navbar />
 <main className="flex-1">
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
      <SiteIndexLinks />
      </main>
 <Footer />
 </div>
 );
};

export default Index;
