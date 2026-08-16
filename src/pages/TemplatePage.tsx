import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import TemplateDownloadForm from "@/components/marketing/TemplateDownloadForm";
import { getMaintenanceTemplate, maintenanceTemplates } from "@/data/maintenanceTemplates";

const TemplatePage = () => {
  const { slug = "" } = useParams();
  const template = getMaintenanceTemplate(slug);
  if (!template) return <Navigate to="/templates" replace />;

  const url = `https://maintenease.com/templates/${template.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: template.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  const creativeWorkLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: template.title,
    description: template.metaDescription,
    url,
    encodingFormat: template.downloads?.map((download) => download.format) ?? ["CSV"],
    isAccessibleForFree: true,
    datePublished: template.published,
    dateModified: template.updated,
    author: { "@type": "Organization", name: "MaintenEase" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Templates", item: "https://maintenease.com/templates" },
      { "@type": "ListItem", position: 2, name: template.title, item: url },
    ],
  };
  const relatedTemplates = maintenanceTemplates.filter((item) => item.slug !== template.slug);

  return (
    <MarketingLayout>
      <Helmet>
        <title>{template.metaTitle}</title>
        <meta name="description" content={template.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={template.metaTitle} />
        <meta property="og:description" content={template.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={template.metaTitle} />
        <meta name="twitter:description" content={template.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(creativeWorkLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <MarketingJsonLd />

      <article>
        <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/templates" className="transition-colors duration-150 hover:text-primary">Templates</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">{template.title}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                {template.eyebrow}
              </div>
              <h1 className="mt-5 max-w-3xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">
                {template.h1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
                {template.intro}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {template.includes.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm leading-relaxed text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <TemplateDownloadForm
              sourceSlug={template.slug}
              templateTitle={template.title}
              downloadPath={template.downloadPath}
              downloadFilename={template.downloadFilename}
              downloads={template.downloads}
            />
          </div>
        </section>

        {template.downloads?.length ? (
          <section className="container mx-auto max-w-6xl px-4 pb-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {template.downloads.map((download) => (
                <div key={download.path} className="rounded-2xl bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{download.format}</p>
                  <p className="mt-1 font-semibold text-foreground">{download.label}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-y border-border bg-muted/30 py-14">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="font-headline text-3xl font-bold text-foreground text-balance">Template preview</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed text-pretty">
              The download includes all fields described below. These example rows show the intended level of detail.
            </p>
            <div className="mt-7 overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">Example rows from the {template.title}</caption>
                <thead className="bg-muted/60">
                  <tr>
                    {template.previewHeaders.map((header) => (
                      <th key={header} scope="col" className="px-4 py-3 font-semibold text-foreground">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {template.previewRows.map((row) => (
                    <tr key={row.join("|")} className="border-t border-border">
                      {row.map((cell, index) => (
                        <td key={`${cell}-${index}`} className="px-4 py-4 text-foreground tabular-nums">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-headline text-3xl font-bold text-foreground text-balance">Fields included</h2>
            <dl className="mt-7 divide-y divide-border rounded-2xl border border-border bg-card px-5">
              {template.columns.map((column) => (
                <div key={column.name} className="py-4 sm:grid sm:grid-cols-[160px_1fr] sm:gap-4">
                  <dt className="font-semibold text-foreground">{column.name}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-0">{column.purpose}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-headline text-3xl font-bold text-foreground text-balance">How to use it</h2>
            <ol className="mt-7 space-y-5">
              {template.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[40px_1fr] gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 pb-16">
          <h2 className="font-headline text-3xl font-bold text-foreground text-balance">Frequently asked questions</h2>
          <div className="mt-7 space-y-4">
            {template.faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <h2 className="font-headline text-2xl font-bold text-foreground text-balance">Move beyond the spreadsheet when the team is ready</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground text-pretty">
              Templates are a practical starting point. When assignments, due dates, photos, and audit history become hard to manage in rows, MaintenEase turns the same process into a shared workflow.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={template.relatedSolution.href}
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary-variant hover:shadow-md active:scale-[0.96]"
              >
                {template.relatedSolution.label}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={template.relatedLearn.href}
                className="inline-flex min-h-11 items-center rounded-xl border border-primary/25 bg-background px-5 py-2.5 font-semibold text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.96]"
              >
                {template.relatedLearn.label}
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <h2 className="font-headline text-2xl font-bold text-foreground">More free maintenance templates</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {relatedTemplates.map((item) => (
              <Link
                key={item.slug}
                to={`/templates/${item.slug}`}
                className="rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/30 hover:shadow-md active:scale-[0.96]"
              >
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </MarketingLayout>
  );
};

export default TemplatePage;
