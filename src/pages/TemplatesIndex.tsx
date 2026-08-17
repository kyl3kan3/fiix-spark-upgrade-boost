import { Helmet } from "react-helmet-async";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
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
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Free maintenance templates and checklists" />
      <meta name="twitter:description" content="Practical maintenance-log, PM, work-order, and preliminary hazard analysis templates." />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
    </Helmet>
    <MarketingJsonLd />

    <section className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Templates</p>
      <h1 className="mt-3 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">
        Free maintenance templates that stay useful
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
        Start with clean fields, realistic examples, and a format that opens in Excel or Google Sheets. Each template is free and built for the work maintenance teams do every day.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {maintenanceTemplates.map((template) => (
          <Link
            key={template.slug}
            to={`/templates/${template.slug}`}
            className="group flex min-h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/30 hover:shadow-md active:scale-[0.96]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground text-balance">{template.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">{template.intro}</p>
            <span className="mt-6 inline-flex min-h-10 items-center font-semibold text-primary">
              Preview and download
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  </MarketingLayout>
);

export default TemplatesIndex;
