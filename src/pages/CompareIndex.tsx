import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import ShareButtons from "@/components/marketing/ShareButtons";
import { comparisons, MAINTENEASE_PRO, TEAM_SIZE } from "@/data/comparisons";

const CompareIndex = () => {
  return (
    <MarketingLayout>
      <Helmet>
        <title>MaintenEase vs UpKeep, Fiix, MaintainX & Limble | CMMS Comparison</title>
        <meta
          name="description"
          content="See how MaintenEase compares to UpKeep, Fiix, MaintainX, and Limble — the same core CMMS features for one flat fee instead of per-technician pricing."
        />
        <link rel="canonical" href="https://maintenease.com/compare" />
        <meta property="og:title" content="MaintenEase vs other CMMS platforms" />
        <meta property="og:description" content="Flat-fee CMMS vs per-seat competitors — compared side by side." />
        <meta property="og:url" content="https://maintenease.com/compare" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=2" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase vs other CMMS platforms" />
        <meta name="twitter:description" content="Flat-fee CMMS vs per-seat competitors — compared side by side." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=2" />
      </Helmet>
      <MarketingJsonLd />
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <p className="text-sm font-medium text-primary mb-3">Compare</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          MaintenEase vs the other CMMS platforms
        </h1>
        <p className="text-lg text-foreground max-w-3xl mb-12">
          Most CMMS tools bill per technician, so the cost climbs every time your crew grows. MaintenEase delivers the
          same core workflow — work orders, assets, preventive and predictive maintenance — for one flat ${MAINTENEASE_PRO}/mo.
          Here's how it stacks up, and what a team of {TEAM_SIZE} would pay.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              to={`/compare/${c.slug}`}
              className="block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-semibold mb-2 text-foreground">{c.h1}</h2>
              <p className="text-foreground mb-3">{c.tagline}</p>
              <p className="text-sm text-muted-foreground">
                Team of {TEAM_SIZE}: <span className="font-semibold text-primary">${MAINTENEASE_PRO}/mo</span> vs{" "}
                <span className="font-medium">${c.competitorPricePerUser * TEAM_SIZE}/mo</span> on {c.competitor}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Not sure which numbers apply to you?</h2>
            <p className="text-sm text-muted-foreground">
              Slide to your team size and see every vendor's monthly bill side by side — breakevens included.
            </p>
          </div>
          <Link
            to="/cmms-cost-calculator"
            className="shrink-0 font-semibold text-primary hover:underline"
          >
            Open the cost calculator →
          </Link>
        </div>
        <div className="mt-12 flex flex-col items-start gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">Share these comparisons</p>
          <ShareButtons
            url="https://maintenease.com/compare"
            title="MaintenEase vs UpKeep, Fiix, MaintainX & Limble"
            description="Flat-fee CMMS vs per-seat competitors — compared side by side."
          />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default CompareIndex;
