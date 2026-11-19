import { useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { getSolution } from "@/data/solutions";
import { SolutionMarketingHero } from "@/pages/solution/SolutionMarketingHero";
import { SolutionPageHead } from "@/pages/solution/SolutionPageHead";
import SolutionPageBelowFold from "@/pages/solution/SolutionPageBelowFold";

/** Full solution page (sync) — used in unit tests; production route uses SolutionMarketingRoute. */
const SolutionPage = () => {
  const { slug = "" } = useParams();
  const solution = getSolution(slug);
  if (!solution) return <Navigate to="/solutions" replace />;

  return (
    <MarketingLayout>
      <SolutionPageHead solution={solution} />
      <SolutionMarketingHero solution={solution} />
      <SolutionPageBelowFold slug={solution.slug} />
    </MarketingLayout>
  );
};

export default SolutionPage;