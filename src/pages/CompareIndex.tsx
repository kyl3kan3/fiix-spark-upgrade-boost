import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import MarketingPrimaryCta from "@/components/marketing/MarketingPrimaryCta";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
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

const CompareIndex = () => (
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
    <MarketingPageHeader title="Compare CMMS pricing" />
    <section className="container mx-auto px-4 pb-16 max-w-5xl">
      <div className="grid sm:grid-cols-2 gap-6">
        {comparisons.map((c) => (
          <Link
            key={c.slug}
            to={`/compare/${c.slug}`}
            className="block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
          >
            <h2 className="text-xl font-semibold text-foreground">{c.h1}</h2>
            <p className="mt-3 text-sm text-foreground tabular-nums">
              Team of {TEAM_SIZE}: ${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo vs{" "}
              {c.competitorPricePerUser === null
                ? "custom"
                : `$${c.competitorPricePerUser * TEAM_SIZE}/mo`}{" "}
              ({c.competitor})
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-10 flex flex-col items-center gap-6">
        <Link to="/cmms-cost-calculator" className="font-semibold text-primary hover:underline">
          CMMS cost calculator
        </Link>
        <MarketingPrimaryCta />
      </div>
    </section>
  </MarketingLayout>
);

export default CompareIndex;
