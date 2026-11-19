import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/router/appRoutes";
import { SentryContextSync } from "@/components/SentryContextSync";
import { GtagRouterTracker } from "@/components/analytics/GtagRouterTracker";
import { MarketingAttributionTracker } from "@/components/analytics/MarketingAttributionTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { CanonicalUrl } from "@/components/CanonicalUrl";

const App = () => (
  <AppProviders>
    <SentryContextSync />
    <GtagRouterTracker />
    <MarketingAttributionTracker />
    <ScrollToTop />
    <CanonicalUrl />
    <AppRoutes />
  </AppProviders>
);

export default App;
