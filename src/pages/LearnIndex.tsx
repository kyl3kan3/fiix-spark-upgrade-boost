import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import { glossary } from "@/data/glossary";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { buildItemListJsonLd } from "@/data/productCatalog";

const LearnIndex = () => (
 <MarketingLayout>
 <Helmet>
 <title>Maintenance Glossary | MaintenEase</title>
 <meta name="description" content="Plain-English definitions of the terms maintenance teams use every day — CMMS, preventive maintenance, work orders, MRO, and more." />
 <link rel="canonical" href="https://maintenease.com/learn" />
 <meta property="og:title" content="Maintenance Glossary | MaintenEase" />
 <meta property="og:description" content="Plain-English definitions of the terms maintenance teams use every day." />
 <meta property="og:url" content="https://maintenease.com/learn" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="Maintenance Glossary | MaintenEase" />
 <meta name="twitter:description" content="Plain-English definitions of the terms maintenance teams use every day." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
 <script type="application/ld+json">{JSON.stringify(buildItemListJsonLd(
 "MaintenEase maintenance glossary",
 "https://maintenease.com/learn",
 glossary.map((entry) => ({
 name: entry.term,
 url: `https://maintenease.com/learn/${entry.slug}`,
 description: entry.short,
 })),
 ))}</script>
 </Helmet>
 <MarketingJsonLd />
 <MarketingPageHeader title="Maintenance glossary" />
 <section className="container mx-auto px-4 pb-16 max-w-5xl">
 <Link
 to="/facility-management"
 className="mb-8 block rounded-2xl border border-border bg-card p-6 hover:border-primary/30"
 >
 <h2 className="text-xl font-semibold text-foreground">Facility management guide</h2>
 </Link>
 <div className="grid sm:grid-cols-2 gap-4">
 {glossary.map((g) => (
 <Link
 key={g.slug}
 to={`/learn/${g.slug}`}
 className="block p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
 >
 <h2 className="text-xl font-semibold text-foreground">{g.term}</h2>
 </Link>
 ))}
 </div>
 </section>
 </MarketingLayout>
);

export default LearnIndex;
