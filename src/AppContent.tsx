import { SentryContextSync } from "@/components/SentryContextSync";
import { GtagRouterTracker } from "@/components/analytics/GtagRouterTracker";
import { MarketingAttributionTracker } from "@/components/analytics/MarketingAttributionTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { CanonicalUrl } from "@/components/CanonicalUrl";
import { AppRoutes } from "@/router/appRoutes";
import { SsrAppRoutes } from "@/router/ssrAppRoutes";
import { isMarketingSsrDocument } from "@/lib/marketingHydration";
import type { ComponentType } from "react";

function defaultRoutesComponent(): ComponentType {
  if (typeof document === "undefined") return AppRoutes;
  return isMarketingSsrDocument() ? SsrAppRoutes : AppRoutes;
}

/** Router-agnostic app tree (shared by client App and SSR entry-server). */
export function AppContent({ RoutesComponent }: { RoutesComponent?: ComponentType }) {
  const RoutesTree = RoutesComponent ?? defaultRoutesComponent();
  return (
    <>
      <SentryContextSync />
      <GtagRouterTracker />
      <MarketingAttributionTracker />
      <ScrollToTop />
      <CanonicalUrl />
      <RoutesTree />
    </>
  );
}