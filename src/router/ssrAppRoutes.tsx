import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import UnsubscribePage from "@/pages/UnsubscribePage";
import FeatureDemoPage from "@/pages/FeatureDemoPage";
import PricingPage from "@/pages/PricingPage";
import FeaturesPage from "@/pages/FeaturesPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import RefundPolicy from "@/pages/RefundPolicy";
import SmsOptIn from "@/pages/SmsOptIn";
import LearnIndex from "@/pages/LearnIndex";
import LearnArticle from "@/pages/LearnArticle";
import SolutionsIndex from "@/pages/SolutionsIndex";
import SolutionPage from "@/pages/SolutionPage";
import CompareIndex from "@/pages/CompareIndex";
import ComparePage from "@/pages/ComparePage";
import TemplatesIndex from "@/pages/TemplatesIndex";
import TemplatePage from "@/pages/TemplatePage";
import McpPage from "@/pages/McpPage";
import CostCalculatorPage from "@/pages/CostCalculatorPage";
import BestCmmsSmallBusinessPage from "@/pages/BestCmmsSmallBusinessPage";
import PublicRequestPortal from "@/pages/PublicRequestPortal";
import OAuthConsentPage from "@/pages/OAuthConsentPage";
import BlogIndex from "@/pages/BlogIndex";
import BlogPost from "@/pages/BlogPost";
import Landing from "@/pages/Landing";
import MaintenanceSimplifiedPage from "@/pages/MaintenanceSimplifiedPage";
import FacilityManagementPage from "@/pages/FacilityManagementPage";
import SupportPage from "@/pages/SupportPage";
import SopGeneratorPage from "@/pages/SopGeneratorPage";
import FishboneGeneratorPage from "@/pages/FishboneGeneratorPage";
import MtbfCalculatorPage from "@/pages/MtbfCalculatorPage";
import AboutPage from "@/pages/AboutPage";
import EditorialPolicyPage from "@/pages/EditorialPolicyPage";
import SitemapPage from "@/pages/SitemapPage";
import { PROTECTED_ROUTES } from "./routeManifest";

/** SSR-only route tree: eager imports so renderToString does not suspend. */
export const SsrAppRoutes = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/signup" element={<Navigate to="/auth?signup=true" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/feature/:title" element={<FeatureDemoPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/refunds" element={<Navigate to="/refund-policy" replace />} />
      <Route path="/sms-opt-in" element={<SmsOptIn />} />
      <Route path="/sms" element={<Navigate to="/sms-opt-in" replace />} />
      <Route path="/learn" element={<LearnIndex />} />
      <Route path="/learn/:slug" element={<LearnArticle />} />
      <Route path="/solutions" element={<SolutionsIndex />} />
      <Route path="/solutions/:slug" element={<SolutionPage />} />
      <Route path="/compare" element={<CompareIndex />} />
      <Route path="/compare/:slug" element={<ComparePage />} />
      <Route path="/templates" element={<TemplatesIndex />} />
      <Route path="/templates/:slug" element={<TemplatePage />} />
      <Route path="/mcp" element={<McpPage />} />
      <Route path="/cmms-cost-calculator" element={<CostCalculatorPage />} />
      <Route path="/best-cmms-software-for-small-business" element={<BestCmmsSmallBusinessPage />} />
      <Route path="/maintenance-simplified" element={<MaintenanceSimplifiedPage />} />
      <Route path="/facility-management" element={<FacilityManagementPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
      <Route path="/sitemap" element={<SitemapPage />} />
      <Route path="/tools/maintenance-sop-generator" element={<SopGeneratorPage />} />
      <Route path="/tools/root-cause-fishbone-generator" element={<FishboneGeneratorPage />} />
      <Route path="/tools/mtbf-calculator" element={<MtbfCalculatorPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route
        path="/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026"
        element={<Navigate to="/learn/preventive-maintenance" replace />}
      />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/r/:slug" element={<PublicRequestPortal />} />
      <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
      {PROTECTED_ROUTES.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ErrorBoundary>
);