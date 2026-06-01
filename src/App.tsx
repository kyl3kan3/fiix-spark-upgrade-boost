import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/router/appRoutes";
import { SentryContextSync } from "@/components/SentryContextSync";
import { GtagRouterTracker } from "@/components/analytics/GtagRouterTracker";
import ScrollToTop from "@/components/ScrollToTop";

const App = () => (
  <AppProviders>
    <SentryContextSync />
    <GtagRouterTracker />
    <ScrollToTop />
    <AppRoutes />
  </AppProviders>
);

export default App;
