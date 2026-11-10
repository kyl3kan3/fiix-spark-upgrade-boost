import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import MarketingPrimaryCta from "@/components/marketing/MarketingPrimaryCta";
import { solutions } from "@/data/solutions";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { buildItemListJsonLd } from "@/data/productCatalog";

const SolutionsIndex = () => (
 <MarketingLayout>
 <Helmet>
 <title>Solutions — Work Orders, PMs & Fleet | MaintenEase</title>
 <meta name="description" content="Explore seven MaintenEase workflows for work orders, preventive maintenance, facilities, fleets, assets, inspections, and maintenance requests." />
 <link rel="canonical" href="https://maintenease.com/solutions" />
 <meta property="og:title" content="Solutions | MaintenEase" />
 <meta property="og:description" content="Work orders, preventive maintenance, facilities, and fleet — one platform." />
 <meta property="og:url" content="https://maintenease.com/solutions" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="Solutions | MaintenEase" />
 <meta name="twitter:description" content="Work orders, preventive maintenance, facilities, and fleet — one platform." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
 <script type="application/ld+json">{JSON.stringify(buildItemListJsonLd(
 "MaintenEase CMMS solutions",
 "https://maintenease.com/solutions",
 solutions.map((solution) => ({
 name: solution.name,
 url: `https://maintenease.com/solutions/${solution.slug}`,
 description: solution.tagline,
 })),
 ))}</script>
 </Helmet>
 <MarketingJsonLd />
 <MarketingPageHeader title="Solutions" />
 <section className="container mx-auto px-4 pb-16 max-w-5xl">
 <div className="grid sm:grid-cols-2 gap-6">
 {solutions.map((s) => (
 <Link
 key={s.slug}
 to={`/solutions/${s.slug}`}
 className="block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
 >
 <h2 className="text-xl font-semibold text-foreground">{s.name}</h2>
 </Link>
 ))}
 </div>
 <div className="mt-12 flex justify-center">
 <MarketingPrimaryCta />
 </div>
 </section>
 </MarketingLayout>
);

export default SolutionsIndex;
