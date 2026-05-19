import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { glossary } from "@/data/glossary";

const LearnIndex = () => {
  return (
    <MarketingLayout>
      <Helmet>
        <title>Maintenance Glossary — Plain-English Definitions | MaintenEase</title>
        <meta name="description" content="Plain-English definitions of the terms maintenance teams use every day — CMMS, preventive maintenance, work orders, MRO, and more." />
        <link rel="canonical" href="https://maintenease.com/learn" />
        <meta property="og:title" content="Maintenance Glossary | MaintenEase" />
        <meta property="og:description" content="Plain-English definitions of the terms maintenance teams use every day." />
        <meta property="og:url" content="https://maintenease.com/learn" />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <p className="text-sm font-medium text-maintenease-600 mb-3">Learn</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Maintenance Glossary</h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-12">
          Plain-English definitions of the terms maintenance, facilities, and fleet teams use every day. Skim, search, or send a link to a colleague.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {glossary.map((g) => (
            <Link
              key={g.slug}
              to={`/learn/${g.slug}`}
              className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-maintenease-500 hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{g.term}</h2>
              <p className="text-gray-600">{g.short}</p>
            </Link>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default LearnIndex;