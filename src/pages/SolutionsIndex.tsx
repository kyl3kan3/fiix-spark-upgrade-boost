import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { solutions } from "@/data/solutions";

const SolutionsIndex = () => {
  return (
    <MarketingLayout>
      <Helmet>
        <title>Solutions — Work Orders, PMs & Fleet | MaintenEase</title>
        <meta name="description" content="See how MaintenEase fits your team — work order software, preventive maintenance, facility maintenance, and fleet maintenance, all in one platform." />
        <link rel="canonical" href="https://maintenease.com/solutions" />
        <meta property="og:title" content="Solutions | MaintenEase" />
        <meta property="og:description" content="Work orders, preventive maintenance, facilities, and fleet — one platform." />
        <meta property="og:url" content="https://maintenease.com/solutions" />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <p className="text-sm font-medium text-maintenease-600 mb-3">Solutions</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">One platform, four ways to use it</h1>
        <p className="text-lg text-gray-600 max-w-3xl mb-12">
          Whether you are chasing work orders, scheduling preventive tasks, looking after buildings, or keeping vehicles on the road — MaintenEase is built for the job.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {solutions.map((s) => (
            <Link
              key={s.slug}
              to={`/solutions/${s.slug}`}
              className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-maintenease-500 hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{s.name}</h2>
              <p className="text-gray-600">{s.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default SolutionsIndex;