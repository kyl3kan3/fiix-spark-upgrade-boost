import { Helmet } from "react-helmet-async";
import { FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { maintenanceTemplates } from "@/data/maintenanceTemplates";
import { buildItemListJsonLd } from "@/data/productCatalog";

const itemListLd = buildItemListJsonLd(
  "Free maintenance templates",
  "https://maintenease.com/templates",
  maintenanceTemplates.map((template) => ({
    name: template.title,
    url: `https://maintenease.com/templates/${template.slug}`,
    description: template.metaDescription,
  })),
);

const TemplatesIndex = () => (
  <MarketingLayout>
    <Helmet>
      <title>Free Maintenance Templates & Checklists | MaintenEase</title>
      <meta
        name="description"
        content="Download free maintenance logs, preventive-maintenance checklists, work orders, and preliminary hazard analysis templates for Excel and Google Sheets."
      />
      <link rel="canonical" href="https://maintenease.com/templates" />
      <meta property="og:title" content="Free maintenance templates and checklists" />
      <meta property="og:description" content="Practical maintenance-log, PM, work-order, and preliminary hazard analysis templates." />
      <meta property="og:url" content="https://maintenease.com/templates" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Free maintenance templates and checklists" />
      <meta name="twitter:description" content="Practical maintenance-log, PM, work-order, and preliminary hazard analysis templates." />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
      <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
    </Helmet>
    <MarketingJsonLd />

    <MarketingPageHeader title="Free maintenance templates" />

    <section className="container mx-auto max-w-6xl px-4 pb-16">
      <div className="grid gap-6 md:grid-cols-3">
        {maintenanceTemplates.map((template) => (
          <Link
            key={template.slug}
            to={`/templates/${template.slug}`}
            className="group flex min-h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-ui hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{template.title}</h2>
          </Link>
        ))}
      </div>
    </section>
  </MarketingLayout>
);

export default TemplatesIndex;
