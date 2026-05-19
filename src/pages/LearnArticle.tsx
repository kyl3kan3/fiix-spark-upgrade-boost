import { Helmet } from "react-helmet";
import { Link, useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getGlossaryTerm, glossary } from "@/data/glossary";
import { Button } from "@/components/ui/button";

// Anchor text is intentionally varied per source article — keyword-rich but
// contextual, avoiding repetition of the same phrase across the site.
const RELATED_SOLUTIONS: Record<string, { slug: string; anchor: string; tagline: string }[]> = {
  cmms: [
    { slug: "asset-management-software", anchor: "Asset management software for CMMS teams", tagline: "Full asset register, lifecycle and TCO reporting inside your CMMS." },
    { slug: "asset-tracking-software", anchor: "QR-code asset tracking inside your CMMS", tagline: "Scan, locate and audit every asset from one CMMS." },
    { slug: "work-order-software", anchor: "Work order software", tagline: "Assign, schedule and close work orders fast." },
  ],
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
};

const LearnArticle = () => {
  const { slug = "" } = useParams();
  const term = getGlossaryTerm(slug);

  if (!term) return <Navigate to="/learn" replace />;

  const url = `https://maintenease.com/learn/${term.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: term.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <article className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/learn" className="hover:text-maintenease-600">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{term.term}</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{term.term}</h1>
        <p className="text-xl text-gray-600 mb-10">{term.short}</p>

        <div className="space-y-10">
          {term.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">{s.heading}</h2>
              <p className="text-gray-700 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Frequently asked questions</h2>
          <div className="space-y-4">
            {term.faqs.map((f) => (
              <div key={f.q} className="p-5 rounded-lg border border-gray-200 bg-white">
                <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 p-8 rounded-xl bg-maintenease-50 border border-maintenease-100">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Put this into practice with MaintenEase</h2>
          <p className="text-gray-700 mb-5">
            MaintenEase is modern maintenance management software built for teams that want to stop firefighting. Start free and see your work in one place in minutes.
          </p>
          <Button asChild>
            <Link to="/auth?signup=true">Start free</Link>
          </Button>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Related terms</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/learn/${r.slug}`}
                  className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-maintenease-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{r.term}</h3>
                  <p className="text-sm text-gray-600">{r.short}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedSolutions.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Related solutions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedSolutions.map((r) => (
                <Link
                  key={r.slug}
                  to={`/solutions/${r.slug}`}
                  className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-maintenease-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{r.anchor}</h3>
                  <p className="text-sm text-gray-600">{r.tagline}</p>
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