import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import { featureItems } from "@/components/features/FeaturesData";
import { buildItemListJsonLd } from "@/data/productCatalog";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>CMMS Features — Work Orders, Assets & PM | MaintenEase</title>
        <meta
          name="description"
          content="Mobile-friendly CMMS features: work orders, preventive maintenance, asset tracking, inspections, a public request portal, and parts inventory."
        />
        <link rel="canonical" href="https://maintenease.com/features" />
        <meta property="og:title" content="Features — MaintenEase" />
        <meta
          property="og:description"
          content="Mobile-friendly CMMS features: work orders, PMs, assets, inspections, a public request portal, and parts inventory."
        />
        <meta property="og:url" content="https://maintenease.com/features" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Features — MaintenEase" />
        <meta
          name="twitter:description"
          content="Every MaintenEase feature, in one place."
        />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">
          {JSON.stringify(buildItemListJsonLd(
            "MaintenEase CMMS features",
            "https://maintenease.com/features",
            featureItems.map((feature) => ({
              name: feature.title,
              url: "https://maintenease.com/features",
              description: feature.description,
            })),
          ))}
        </script>
      </Helmet>
      <Navbar />
      <main className="flex-1 pt-24">
        <MarketingPageHeader title="Features" />
        <Features variant="page" />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
