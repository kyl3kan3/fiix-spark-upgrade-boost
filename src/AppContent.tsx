import { SentryContextSync } from "@/components/SentryContextSync";
import { GtagRouterTracker } from "@/components/analytics/GtagRouterTracker";
import { MarketingAttributionTracker } from "@/components/analytics/MarketingAttributionTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { CanonicalUrl } from "@/components/CanonicalUrl";
import { useEffect, useState } from "react";
import { AppRoutes } from "@/router/appRoutes";
import type { ComponentType } from "react";

/** Router-agnostic app tree (shared by client App and SSR entry-server). */
export function AppContent({
  RoutesComponent,
  /** First paint while hydrating marketing SSR: eager route chunk + no RouteSuspense. */
  marketingHydratePhase,
}: {
  RoutesComponent?: ComponentType;
  marketingHydratePhase?: boolean;
}) {
  const [useClientRouteLoading, setUseClientRouteLoading] = useState(!marketingHydratePhase);

  useEffect(() => {
    if (marketingHydratePhase) setUseClientRouteLoading(true);
  }, [marketingHydratePhase]);

  const skipRouteSuspense = Boolean(marketingHydratePhase && !useClientRouteLoading);

  return (
    <>
      <SentryContextSync />
      <GtagRouterTracker />
      <MarketingAttributionTracker />
      <ScrollToTop />
      <CanonicalUrl />
      {RoutesComponent ? (
        <RoutesComponent />
      ) : (
        <AppRoutes skipRouteSuspense={skipRouteSuspense} />
      )}
    </>
  );
}