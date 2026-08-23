import { Helmet } from "react-helmet-async";
import { Download, FileCheck2 } from "lucide-react";
import { Link, useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getGlossaryTerm, glossary } from "@/data/glossary";
import { Button } from "@/components/ui/button";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import PreventiveMaintenanceCapacityCalculator from "@/components/marketing/PreventiveMaintenanceCapacityCalculator";
import { trackMarketingEvent } from "@/lib/analytics/marketingEvents";

const sectionId = (heading: string) =>
 heading
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/^-|-$/g, "");

const SAFETY_SCOPE_SLUGS = new Set([
 "preventive-maintenance",
 "total-productive-maintenance",
 "predictive-maintenance",
 "condition-based-maintenance",
 "corrective-maintenance",
 "root-cause-analysis",
 "infrared-thermography-inspection",
]);

// Anchor text is intentionally varied per source article — keyword-rich but
// contextual, avoiding repetition of the same phrase across the site.
const RELATED_SOLUTIONS: Record<string, { slug: string; anchor: string; tagline: string }[]> = {
 "preventive-maintenance": [
 { slug: "asset-management-software", anchor: "Asset register built for preventive maintenance", tagline: "Tie recurring work to the asset, parts and history." },
 { slug: "preventive-maintenance-software", anchor: "Preventive maintenance software", tagline: "Calendar-based recurring maintenance and overdue work." },
 ],
 "work-order": [
 { slug: "work-order-software", anchor: "Work order software", tagline: "Assign, schedule and close work orders fast." },
 { slug: "asset-tracking-software", anchor: "Track the asset behind every work order", tagline: "Attach work to a located, searchable asset record." },
 ],
 "facility-maintenance": [
 { slug: "facility-maintenance-software", anchor: "Facility maintenance software", tagline: "Run buildings, rooms and equipment." },
 { slug: "asset-tracking-software", anchor: "Track facility assets by location", tagline: "Keep equipment labelled, searchable and located." },
 { slug: "asset-management-software", anchor: "Manage your facility asset register", tagline: "Equipment records, attachments and maintenance history." },
 ],
 "fleet-maintenance": [
 { slug: "fleet-maintenance-software", anchor: "Fleet maintenance software", tagline: "Vehicle PMs and full service history." },
 { slug: "asset-management-software", anchor: "Manage every vehicle as a tracked asset", tagline: "Per-vehicle work, cost and maintenance history." },
 ],
 mro: [
 { slug: "asset-management-software", anchor: "Asset management software for MRO operations", tagline: "Asset records, parts and maintenance history in one place." },
 { slug: "asset-tracking-software", anchor: "Track tools and shop-floor equipment", tagline: "Searchable records, locations and printable Code 128 labels." },
 ],
 "building-maintenance": [
 { slug: "facility-maintenance-software", anchor: "Facility maintenance software", tagline: "Buildings, rooms and equipment in one place." },
 { slug: "asset-tracking-software", anchor: "Asset tracking across every building", tagline: "Find equipment by search or location tree." },
 ],
 "property-maintenance": [
 { slug: "maintenance-request-portal", anchor: "Maintenance request portal", tagline: "Tenants and staff submit requests." },
 { slug: "asset-management-software", anchor: "Track every appliance, HVAC unit and fixture", tagline: "Per-unit asset record and service history." },
 ],
 "agentic-cmms": [
 { slug: "work-order-software", anchor: "Work order software for agent-assisted workflows", tagline: "Create, assign, and track the work an authorized agent helps prepare." },
 { slug: "asset-management-software", anchor: "Asset data for maintenance agents", tagline: "Keep equipment records and service history in one controlled system." },
 ],
 "ai-maintenance-assistant": [
 { slug: "work-order-software", anchor: "Work order software with structured workflows", tagline: "Turn maintenance context into complete, trackable work." },
 ],
 "cmms-for-chatgpt": [
 { slug: "asset-management-software", anchor: "Controlled asset data for AI workflows", tagline: "Keep equipment identity and history in the CMMS system of record." },
 ],
 "maintenance-mcp-server": [
 { slug: "work-order-software", anchor: "Work order tools for maintenance agents", tagline: "Expose narrow actions instead of unrestricted database access." },
 ],
 "ai-work-order-automation": [
 { slug: "work-order-software", anchor: "Automate work order intake", tagline: "Create, assign, and track work from one structured workflow." },
 { slug: "maintenance-request-portal", anchor: "Capture requests before automating them", tagline: "Collect issue details and photos without requiring a login." },
 ],
 "equipment-risk-scoring": [
 { slug: "asset-management-software", anchor: "Build risk scores on reliable asset history", tagline: "Centralize failures, cost, downtime, and asset criticality." },
 ],
 "predictive-maintenance-without-sensors": [
 { slug: "preventive-maintenance-software", anchor: "Start with scheduled readings and inspections", tagline: "Build consistent condition history before a sensor rollout." },
 { slug: "asset-management-software", anchor: "Connect every reading to an asset", tagline: "Keep work history and equipment context together." },
 ],
 "maintenance-request-qr-codes": [
 { slug: "maintenance-request-portal", anchor: "No-login maintenance request portal", tagline: "Let tenants, staff, and guests report problems in seconds." },
 { slug: "asset-tracking-software", anchor: "Connect QR codes to tracked assets", tagline: "Identify equipment and its location from the point of work." },
 ],
 "ai-native-cmms": [
 { slug: "asset-management-software", anchor: "The asset data layer behind AI-native maintenance", tagline: "Give every workflow consistent equipment identity and history." },
 ],
 "agentic-maintenance-workflows": [
 { slug: "work-order-software", anchor: "Put agent-assisted work into a controlled workflow", tagline: "Keep requests, approvals, assignments, and completion traceable." },
 ],
};

const LearnArticle = () => {
 const { slug = "" } = useParams();
 const term = getGlossaryTerm(slug);

 if (!term) return <Navigate to="/learn" replace />;

 const url = `https://maintenease.com/learn/${term.slug}`;
 const representativeImage = term.image ? `https://maintenease.com${term.image.src}` : null;
 const faqLd = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 mainEntity: term.faqs.map((f) => ({
 "@type": "Question",
 name: f.q,
 acceptedAnswer: { "@type": "Answer", text: f.a },
 })),
 };
 const articleLd = {
 "@context": "https://schema.org",
 "@type": "Article",
 headline: term.term,
 description: term.short,
 mainEntityOfPage: { "@type": "WebPage", "@id": url },
 inLanguage: "en",
 author: { "@type": "Organization", name: "MaintenEase editorial team", url: "https://maintenease.com/editorial-policy" },
 ...(representativeImage ? { image: representativeImage } : {}),
 publisher: {
 "@type": "Organization",
 name: "MaintenEase",
 logo: { "@type": "ImageObject", url: "https://maintenease.com/favicon.png" },
 },
 ...(term.published ? { datePublished: term.published } : {}),
 ...(term.updated ? { dateModified: term.updated } : {}),
 };
 const breadcrumbLd = {
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 itemListElement: [
 { "@type": "ListItem", position: 1, name: "Learn", item: "https://maintenease.com/learn" },
 { "@type": "ListItem", position: 2, name: term.term, item: url },
 ],
 };

 const related = term.related
 // Every glossary page links back to the /learn/cmms pillar so the hub page
 // accumulates internal links from the whole cluster.
 .concat(term.slug === "cmms" ? [] : ["cmms"])
 .filter((s, i, arr) => arr.indexOf(s) === i)
 .map((s) => glossary.find((g) => g.slug === s))
 .filter((g): g is NonNullable<typeof g> => Boolean(g));

 const relatedSolutions = RELATED_SOLUTIONS[term.slug] ?? [];
 const hasOnPageNavigation = term.sections.length >= 6;
 const isPreventiveGuide = term.slug === "preventive-maintenance";
 const isTpmGuide = term.slug === "total-productive-maintenance";
 const needsSafetyScope = SAFETY_SCOPE_SLUGS.has(term.slug);
 const trackTpmDownload = (format: string, filename: string) => {
  void trackMarketingEvent({
   eventType: "template_download",
   pageSlug: term.slug,
   metadata: { resource: "TPM implementation toolkit", format, filename },
  });
 };

 return (
 <MarketingLayout>
 <Helmet>
 <title>{term.metaTitle}</title>
 <meta name="description" content={term.metaDescription} />
 <link rel="canonical" href={url} />
 <meta property="og:title" content={term.metaTitle} />
 <meta property="og:description" content={term.metaDescription} />
 <meta property="og:url" content={url} />
 <meta property="og:type" content="article" />
 <meta property="og:image" content={representativeImage ?? "https://maintenease.com/og-image.png?v=4"} />
 {term.image && <meta property="og:image:alt" content={term.image.alt} />}
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content={term.metaTitle} />
 <meta name="twitter:description" content={term.metaDescription} />
 <meta name="twitter:image" content={representativeImage ?? "https://maintenease.com/og-image.png?v=4"} />
 <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
 <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
 <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
 </Helmet>
 <MarketingJsonLd />
 <article className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
 <nav className="text-sm text-muted-foreground mb-6">
 <Link to="/learn" className="hover:text-primary">Learn</Link>
 <span className="mx-2">/</span>
 <span className="text-foreground">{term.term}</span>
 </nav>
 <h1 className="text-4xl md:text-5xl font-bold tracking-normal mb-4 text-balance">{term.term}</h1>
 <p className="text-xl text-foreground text-pretty">{term.short}</p>
 <div className="mt-5 mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
  <span>By the <Link to="/editorial-policy" className="font-medium text-primary underline underline-offset-4">MaintenEase editorial team</Link></span>
  {(term.updated ?? term.published) && <span aria-hidden="true">·</span>}
  {(term.updated ?? term.published) && (
   <span>Updated <time dateTime={term.updated ?? term.published}>{new Date(`${term.updated ?? term.published}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></span>
  )}
  <span aria-hidden="true">·</span>
  <Link to="/editorial-policy" className="text-primary underline underline-offset-4">Methodology and corrections</Link>
 </div>

 {term.image && (
  <figure className="mb-10 overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_24px_rgba(15,37,68,0.10)]">
   <img src={term.image.src} alt={term.image.alt} width={1200} height={630} className="aspect-[1200/630] w-full object-cover outline outline-1 -outline-offset-1 outline-black/5" />
  </figure>
 )}

 {needsSafetyScope && (
  <aside className="mb-10 rounded-2xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 shadow-[0_0_0_1px_rgba(146,64,14,0.14)]">
   <strong>Scope:</strong> This guide is general educational material. Use the employer&apos;s hazard assessment, energy-control program, manufacturer instructions, qualified-person rules, approved procedures, and applicable law. Stop work when authorization, safe conditions, or required technical information are missing.
  </aside>
 )}

 {hasOnPageNavigation && (
 <nav aria-label="On this page" className="mb-12 rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
 <p className="text-sm font-semibold uppercase tracking-wide text-primary">On this page</p>
 <ol className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
 {term.sections.map((section, index) => (
 <li key={section.heading}>
 <a href={`#${sectionId(section.heading)}`} className="inline-flex min-h-10 items-center text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-primary">
 <span className="mr-2 text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
 {section.heading}
 </a>
 </li>
 ))}
 </ol>
 </nav>
 )}

 <div className="space-y-10">
 {term.sections.map((s) => (
 <section key={s.heading} id={sectionId(s.heading)} className="scroll-mt-24">
 <h2 className="text-2xl font-semibold mb-3 text-foreground text-balance">{s.heading}</h2>
 <p className="text-foreground leading-relaxed text-pretty">{s.body}</p>
 {s.table && (
 <div className="mt-5 overflow-x-auto rounded-lg border border-border">
 <table className="w-full text-sm">
 {s.table.caption && (
 <caption className="px-4 py-3 text-left text-sm text-muted-foreground">
 {s.table.caption}
 </caption>
 )}
 <thead className="bg-muted/50">
 <tr>
 {s.table.headers.map((h, i) => (
 <th key={i} scope="col" className="px-4 py-3 text-left font-semibold text-foreground">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {s.table.rows.map((row) => (
 <tr key={row.join("|")} className="border-t border-border">
 {row.map((cell, i) => (
 <td key={i} className="px-4 py-3 align-top text-foreground">{cell}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 {isPreventiveGuide && s.heading === "Plan preventive maintenance labor capacity" ? (
 <PreventiveMaintenanceCapacityCalculator />
 ) : null}
 </section>
 ))}
 </div>

 {(isPreventiveGuide || isTpmGuide) && (
 <section className="mt-12 rounded-3xl bg-primary/5 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] sm:p-8">
 <div className="flex items-start gap-3">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
 <FileCheck2 className="h-5 w-5" aria-hidden="true" />
 </span>
 <div>
 <h2 className="text-2xl font-semibold text-foreground text-balance">
 {isPreventiveGuide ? "Preventive maintenance templates" : "TPM audit and implementation downloads"}
 </h2>
 <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">
 {isPreventiveGuide
 ? "Use the schedule fields from this guide in a ready-to-edit checklist, then move recurring work into MaintenEase when assignments and evidence need one shared workflow."
 : "Use the audit to establish a pilot baseline and the 90-day checklist to keep owners, evidence, and review dates visible."}
 </p>
 </div>
 </div>
 <div className="mt-5 flex flex-wrap gap-3">
 {isPreventiveGuide ? (
 <Link to="/templates/preventive-maintenance-checklist" className="inline-flex min-h-11 items-center rounded-xl bg-primary pl-5 pr-[18px] py-2.5 font-semibold text-primary-foreground transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary-variant hover:shadow-md active:scale-[0.96]">
 Get the PM checklist <Download className="ml-2 h-4 w-4" aria-hidden="true" />
 </Link>
 ) : (
 <>
 <a href="/templates/downloads/tpm-audit-worksheet.csv" download onClick={() => trackTpmDownload("CSV", "tpm-audit-worksheet.csv")} className="inline-flex min-h-11 items-center rounded-xl bg-primary pl-5 pr-[18px] py-2.5 font-semibold text-primary-foreground transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary-variant hover:shadow-md active:scale-[0.96]">
 Download TPM audit <Download className="ml-2 h-4 w-4" aria-hidden="true" />
 </a>
 <a href="/templates/downloads/tpm-90-day-implementation-checklist.csv" download onClick={() => trackTpmDownload("CSV", "tpm-90-day-implementation-checklist.csv")} className="inline-flex min-h-11 items-center rounded-xl bg-background px-5 py-2.5 font-semibold text-primary shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-150 hover:shadow-md active:scale-[0.96]">
 Download 90-day checklist <Download className="ml-2 h-4 w-4" aria-hidden="true" />
 </a>
 </>
 )}
 </div>
 </section>
 )}

 <section className="mt-12">
 <h2 className="text-2xl font-semibold mb-4 text-foreground">Frequently asked questions</h2>
 <div className="space-y-4">
 {term.faqs.map((f) => (
 <div key={f.q} className="p-5 rounded-lg border border-border bg-card">
 <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
 <p className="text-foreground">{f.a}</p>
 </div>
 ))}
 </div>
 </section>

 {term.sources && term.sources.length > 0 && (
 <section className="mt-12">
 <h2 className="text-2xl font-semibold mb-4 text-foreground">Sources and further reading</h2>
 <ul className="space-y-3">
 {term.sources.map((source) => (
 <li key={source.url}>
 <a
 href={source.url}
 target="_blank"
 rel="noreferrer"
 className="text-primary underline underline-offset-2 hover:no-underline"
 >
 {source.label}
 </a>
 </li>
 ))}
 </ul>
 </section>
 )}

 <section className="mt-12 p-8 rounded-xl bg-primary/5 border border-primary/20">
 <h2 className="text-2xl font-semibold mb-2 text-foreground text-balance">
 {isPreventiveGuide ? "Create your preventive maintenance program in MaintenEase" : isTpmGuide ? "Turn TPM findings into traceable maintenance work" : "Put this into practice with MaintenEase"}
 </h2>
 <p className="text-foreground mb-5">
 {isPreventiveGuide
 ? "Connect schedules, procedures, work orders, findings, and asset history so every PM creates usable evidence instead of another isolated checklist."
 : isTpmGuide
 ? "Keep operator findings, planned work, causes, downtime, labor, and countermeasures connected to each asset while your TPM routines mature."
 : "MaintenEase is modern maintenance management software built for teams that want to stop firefighting. Start free and see your work in one place in minutes."}
 </p>
  <div className="flex flex-wrap gap-3">
  <Button asChild>
  <Link to="/auth?signup=true">{isPreventiveGuide ? "Create a PM program" : "Start free"}</Link>
  </Button>
  <Button asChild variant="outline">
  <Link to={term.slug === "agentic-cmms" ? "/features" : "/cmms-cost-calculator"}>
  {term.slug === "agentic-cmms" ? "Explore MaintenEase features" : "Run the CMMS cost calculator"}
  </Link>
  </Button>
  </div>
  {term.slug !== "cmms-benchmarks-2026" && (
  <p className="text-sm text-muted-foreground mt-4">
  Standardizing your reporting? Use the <Link to="/learn/cmms-benchmarks-2026" className="text-primary underline underline-offset-2">maintenance KPI reference</Link> to define MTTR, PM compliance, and cost per work order before comparing periods.
  </p>
  )}
 </section>

 {term.internalLinks?.length ? (
 <section className="mt-12">
 <h2 className="text-2xl font-semibold mb-4 text-foreground text-balance">CMMS software and comparisons</h2>
 <div className="grid gap-3 sm:grid-cols-2">
 {term.internalLinks.map((item) => (
 <Link
 key={item.href}
 to={item.href}
 className="flex min-h-12 items-center rounded-xl border border-border bg-card px-5 py-3 font-medium text-primary transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/40 hover:shadow-sm active:scale-[0.96]"
 >
 {item.label}
 </Link>
 ))}
 </div>
 </section>
 ) : null}

 {related.length > 0 && (
 <section className="mt-12">
 <h2 className="text-2xl font-semibold mb-4 text-foreground">Related terms</h2>
 <div className="grid sm:grid-cols-2 gap-4">
 {related.map((r) => (
 <Link
 key={r.slug}
 to={`/learn/${r.slug}`}
 className="block p-5 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
 >
 <h3 className="font-semibold text-foreground mb-1">{r.term}</h3>
 <p className="text-sm text-foreground">{r.short}</p>
 </Link>
 ))}
 </div>
 </section>
 )}

 {relatedSolutions.length > 0 && (
 <section className="mt-12">
 <h2 className="text-2xl font-semibold mb-4 text-foreground">Related solutions</h2>
 <div className="grid sm:grid-cols-2 gap-4">
 {relatedSolutions.map((r) => (
 <Link
 key={r.slug}
 to={`/solutions/${r.slug}`}
 className="block p-5 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-ui"
 >
 <h3 className="font-semibold text-foreground mb-1">{r.anchor}</h3>
 <p className="text-sm text-foreground">{r.tagline}</p>
 </Link>
 ))}
 </div>
 </section>
 )}
 </article>
 </MarketingLayout>
 );
};

export default LearnArticle;
