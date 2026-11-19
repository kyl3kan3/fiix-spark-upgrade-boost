import { matchPath } from "react-router-dom";

type Loader = () => Promise<unknown>;

const exact: Record<string, Loader> = {
  "/forgot-password": () => import("@/pages/ForgotPassword"),
  "/reset-password": () => import("@/pages/ResetPassword"),
  "/unsubscribe": () => import("@/pages/UnsubscribePage"),
  "/pricing": () => import("@/pages/PricingPage"),
  "/features": () => import("@/pages/FeaturesPage"),
  "/privacy": () => import("@/pages/PrivacyPolicy"),
  "/terms": () => import("@/pages/TermsOfService"),
  "/refund-policy": () => import("@/pages/RefundPolicy"),
  "/sms-opt-in": () => import("@/pages/SmsOptIn"),
  "/learn": () => import("@/pages/LearnIndex"),
  "/solutions": () => import("@/pages/SolutionsIndex"),
  "/compare": () => import("@/pages/CompareIndex"),
  "/templates": () => import("@/pages/TemplatesIndex"),
  "/mcp": () => import("@/pages/McpPage"),
  "/cmms-cost-calculator": () => import("@/pages/CostCalculatorPage"),
  "/best-cmms-software-for-small-business": () => import("@/pages/BestCmmsSmallBusinessPage"),
  "/maintenance-simplified": () => import("@/pages/MaintenanceSimplifiedPage"),
  "/facility-management": () => import("@/pages/FacilityManagementPage"),
  "/support": () => import("@/pages/SupportPage"),
  "/about": () => import("@/pages/AboutPage"),
  "/editorial-policy": () => import("@/pages/EditorialPolicyPage"),
  "/sitemap": () => import("@/pages/SitemapPage"),
  "/tools/maintenance-sop-generator": () => import("@/pages/SopGeneratorPage"),
  "/tools/root-cause-fishbone-generator": () => import("@/pages/FishboneGeneratorPage"),
  "/tools/mtbf-calculator": () => import("@/pages/MtbfCalculatorPage"),
  "/blog": () => import("@/pages/BlogIndex"),
  "/landing": () => import("@/pages/Landing"),
};

const patterns: Array<{ pattern: string; loader: Loader }> = [
  { pattern: "/feature/:title", loader: () => import("@/pages/FeatureDemoPage") },
  { pattern: "/learn/:slug", loader: () => import("@/pages/LearnArticle") },
  { pattern: "/solutions/:slug", loader: () => import("@/pages/SolutionPage") },
  { pattern: "/compare/:slug", loader: () => import("@/pages/ComparePage") },
  { pattern: "/templates/:slug", loader: () => import("@/pages/TemplatePage") },
  { pattern: "/blog/:slug", loader: () => import("@/pages/BlogPost") },
  { pattern: "/r/:slug", loader: () => import("@/pages/PublicRequestPortal") },
];

/**
 * Resolves the lazy marketing route chunk for `pathname` before hydration or SSR.
 * Index and /auth use eager imports and need no preload here.
 */
export async function preloadMarketingRoute(pathname: string): Promise<void> {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const exactLoader = exact[normalized];
  if (exactLoader) {
    await exactLoader();
    return;
  }
  for (const { pattern, loader } of patterns) {
    if (matchPath({ path: pattern, end: true }, normalized)) {
      await loader();
      return;
    }
  }
}