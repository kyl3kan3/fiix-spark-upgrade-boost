import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { readSolutionRoutePayload } from "@/lib/solutionRoutePayload";
import { SolutionMarketingHero } from "@/pages/solution/SolutionMarketingHero";
import { SolutionPageHead } from "@/pages/solution/SolutionPageHead";

const SolutionPageBelowFold = lazy(() => import("@/pages/solution/SolutionPageBelowFold"));
const SolutionPageDevFallback = lazy(() => import("@/pages/SolutionPage"));

export default function SolutionMarketingRoute() {
  const { slug = "" } = useParams();
  const payload = readSolutionRoutePayload();

  if (!payload) {
    if (import.meta.env.DEV) {
      return (
        <Suspense fallback={null}>
          <SolutionPageDevFallback />
        </Suspense>
      );
    }
    return <Navigate to="/solutions" replace />;
  }

  if (payload.slug !== slug) {
    return <Navigate to={`/solutions/${payload.slug}`} replace />;
  }

  return (
    <MarketingLayout>
      <SolutionPageHead solution={payload} />
      <SolutionMarketingHero solution={payload} />
      <Suspense fallback={null}>
        <SolutionPageBelowFold slug={slug} />
      </Suspense>
    </MarketingLayout>
  );
}