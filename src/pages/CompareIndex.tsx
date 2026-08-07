import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import ShareButtons from "@/components/marketing/ShareButtons";
import { comparisons, MAINTENEASE_TEAM_PRICE, TEAM_SIZE } from "@/data/comparisons";
import { buildItemListJsonLd, SITE_ORIGIN } from "@/data/productCatalog";

const itemListLd = buildItemListJsonLd(
  "MaintenEase CMMS comparisons",
  `${SITE_ORIGIN}/compare`,
  comparisons.map((comparison) => ({
    name: comparison.h1,
    url: `${SITE_ORIGIN}/compare/${comparison.slug}`,
    description: comparison.tagline,
  })),
);

const CompareIndex = () => {
  return (
    <MarketingLayout>
      <Helmet>
        <title>MaintenEase vs UpKeep, Fiix, MaintainX & Limble</title>
        <meta
          name="description"
          content="Compare MaintenEase account plans and included seats with per-user CMMS pricing, features, capacity limits, and estimated team cost."
        />
        <link rel="canonical" href="https://maintenease.com/compare" />
        <meta property="og:title" content="MaintenEase vs other CMMS platforms" />
        <meta property="og:description" content="Account-plan and per-seat CMMS pricing compared side by side." />
        <meta property="og:url" content="https://maintenease.com/compare" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase vs other CMMS platforms" />
        <meta name="twitter:description" content="Account-plan and per-seat CMMS pricing compared side by side." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>
      <MarketingJsonLd />
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <p className="text-sm font-medium text-primary mb-3">Compare</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-normal mb-4 text-foreground">
          MaintenEase vs the other CMMS platforms
        </h1>
        <p className="text-lg text-foreground max-w-3xl mb-12">
          Compare the published pricing models without hiding the seat math. For {TEAM_SIZE} seats, the lowest
          MaintenEase option is {MAINTENEASE_TEAM_PRICE.plan.name} at ${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo,
          including {MAINTENEASE_TEAM_PRICE.extraSeats} extra seats. Asset or work-order volume may require a higher plan.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              to={`/compare/${c.slug}`}
              className="block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
            >
              <h2 className="text-xl font-semibold mb-2 text-foreground">{c.h1}</h2>
              <p className="text-foreground mb-3">{c.tagline}</p>
              <p className="text-sm text-muted-foreground">
                Team of {TEAM_SIZE}: <span className="font-semibold text-primary">${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo</span> vs{" "}
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
            description="Account-plan and per-seat CMMS pricing compared side by side."
          />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default CompareIndex;
