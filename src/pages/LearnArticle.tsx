import { Helmet } from "react-helmet";
import { Link, useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getGlossaryTerm, glossary } from "@/data/glossary";
import { Button } from "@/components/ui/button";

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
      </article>
    </MarketingLayout>
  );
};

export default LearnArticle;