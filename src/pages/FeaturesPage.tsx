import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/marketing/ShareButtons";

/**
 * Standalone /features marketing page.
 *
 * Previously, /features returned a 404 — the Features section only lived as an
 * anchor (#features) on the Index page. A direct hit to /features is the most
 * common path from G2/Capterra and from comparison searches like
 * "maintainx vs maintenease", so a real, indexable page is required.
 */
const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>Features — MaintenEase</title>
        <meta
          name="description"
          content="Mobile-first work orders, preventive maintenance, asset tracking, inspections, request portal, offline sync, and parts inventory automation. See every MaintenEase feature."
        />
        <link rel="canonical" href="https://maintenease.com/features" />
        <meta property="og:title" content="Features — MaintenEase" />
        <meta
          property="og:description"
          content="Mobile-first CMMS features: work orders, PMs, assets, inspections, request portal, offline sync, parts inventory."
        />
        <meta property="og:url" content="https://maintenease.com/features" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Features — MaintenEase" />
        <meta
          name="twitter:description"
          content="Every MaintenEase feature, in one place."
        />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=2" />
      </Helmet>
      <Navbar />
      <main className="flex-1 pt-24">
        <header className="container mx-auto px-4 max-w-4xl text-center pt-10 pb-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Every feature your maintenance team needs
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Work orders, preventive maintenance, asset tracking, inspections, a
            public request portal, offline sync, and parts inventory — built
            for technicians on the floor, not desk workflows.
          </p>
        </header>
        <Features />
        <CTA />
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Share the feature list
              </h2>
              <p className="text-sm text-foreground">
                Send this to your team or a colleague evaluating CMMS tools.
              </p>
            </div>
            <ShareButtons
              url="https://maintenease.com/features"
              title="MaintenEase Features"
              description="Every MaintenEase feature, in one page."
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
