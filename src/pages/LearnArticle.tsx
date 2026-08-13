import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getGlossaryTerm, glossary } from "@/data/glossary";
import { Button } from "@/components/ui/button";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";

// Anchor text is intentionally varied per source article — keyword-rich but
// contextual, avoiding repetition of the same phrase across the site.
const RELATED_SOLUTIONS: Record<string, { slug: string; anchor: string; tagline: string }[]> = {
 "preventive-maintenance": [
 { slug: "asset-management-software", anchor: "Asset register built for preventive maintenance", tagline: "Tie every PM to an asset with warranty, parts and history." },
 { slug: "preventive-maintenance-software", anchor: "Preventive maintenance software", tagline: "Time and meter-based PM schedules." },
 ],
 "work-order": [
 { slug: "work-order-software", anchor: "Work order software", tagline: "Assign, schedule and close work orders fast." },
 { slug: "asset-tracking-software", anchor: "Track the asset behind every work order", tagline: "Attach every WO to a QR-tagged asset and its service history." },
 ],
 "facility-maintenance": [
 { slug: "facility-maintenance-software", anchor: "Facility maintenance software", tagline: "Run buildings, rooms and equipment." },
 { slug: "asset-tracking-software", anchor: "Track facility assets with QR codes", tagline: "Every room, unit and piece of equipment, labelled and located." },
 { slug: "asset-management-software", anchor: "Manage your facility asset register", tagline: "Lifecycle, warranty and contract tracking across your portfolio." },
 ],
 "fleet-maintenance": [
 { slug: "fleet-maintenance-software", anchor: "Fleet maintenance software", tagline: "Vehicle PMs and full service history." },
 { slug: "asset-management-software", anchor: "Manage every vehicle as a tracked asset", tagline: "Per-vehicle lifecycle, TCO and warranty reporting." },
 ],
 mro: [
 { slug: "asset-management-software", anchor: "Asset management software for MRO operations", tagline: "Asset register, parts and warranty in one place." },
 { slug: "asset-tracking-software", anchor: "Track spares, tools and shop-floor equipment", tagline: "QR-labelled tools and parts with custody history." },
 ],
 "building-maintenance": [
 { slug: "facility-maintenance-software", anchor: "Facility maintenance software", tagline: "Buildings, rooms and equipment in one place." },
 { slug: "asset-tracking-software", anchor: "QR-tagged asset tracking across every building", tagline: "Find any asset by scan, search, or location tree." },
 ],
 "property-maintenance": [
 { slug: "maintenance-request-portal", anchor: "Maintenance request portal", tagline: "Tenants and staff submit requests." },
 { slug: "asset-management-software", anchor: "Track every appliance, HVAC unit and fixture", tagline: "Per-unit asset register with warranty and service history." },
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
 image: "https://maintenease.com/og-image.png?v=4",
 author: { "@type": "Organization", name: "MaintenEase" },
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
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content={term.metaTitle} />
 <meta name="twitter:description" content={term.metaDescription} />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
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
 <h1 className="text-4xl md:text-5xl font-bold tracking-normal mb-4">{term.term}</h1>
 <p className="text-xl text-foreground mb-10">{term.short}</p>

 <div className="space-y-10">
 {term.sections.map((s) => (
 <section key={s.heading}>
 <h2 className="text-2xl font-semibold mb-3 text-foreground">{s.heading}</h2>
 <p className="text-foreground leading-relaxed">{s.body}</p>
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
 </section>
 ))}
 </div>

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
 <h2 className="text-2xl font-semibold mb-2 text-foreground">Put this into practice with MaintenEase</h2>
 <p className="text-foreground mb-5">
 MaintenEase is modern maintenance management software built for teams that want to stop firefighting. Start free and see your work in one place in minutes.
 </p>
  <div className="flex flex-wrap gap-3">
  <Button asChild>
  <Link to="/auth?signup=true">Start free</Link>
  </Button>
  <Button asChild variant="outline">
  <Link to={term.slug === "agentic-cmms" ? "/features" : "/cmms-cost-calculator"}>
  {term.slug === "agentic-cmms" ? "Explore MaintenEase features" : "Run the CMMS cost calculator"}
  </Link>
  </Button>
  </div>
  {term.slug !== "cmms-benchmarks-2026" && (
  <p className="text-sm text-muted-foreground mt-4">
  Comparing your team to the industry? See the <Link to="/learn/cmms-benchmarks-2026" className="text-primary underline underline-offset-2">2026 CMMS benchmarks</Link> for MTTR, PM compliance, and cost per work order.
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
