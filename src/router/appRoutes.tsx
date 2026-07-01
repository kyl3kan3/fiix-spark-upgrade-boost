import React, { Suspense } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { PROTECTED_ROUTES } from "./routeManifest";

// Public / marketing pages. Every authenticated page is registered in
// routeManifest.ts and rendered from the map below.
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const UnsubscribePage = lazy(() => import("@/pages/UnsubscribePage"));
const FeatureDemoPage = lazy(() => import("@/pages/FeatureDemoPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const SmsOptIn = lazy(() => import("@/pages/SmsOptIn"));
const LearnIndex = lazy(() => import("@/pages/LearnIndex"));
const LearnArticle = lazy(() => import("@/pages/LearnArticle"));
const SolutionsIndex = lazy(() => import("@/pages/SolutionsIndex"));
const SolutionPage = lazy(() => import("@/pages/SolutionPage"));
const CompareIndex = lazy(() => import("@/pages/CompareIndex"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const CostCalculatorPage = lazy(() => import("@/pages/CostCalculatorPage"));
const PublicRequestPortal = lazy(() => import("@/pages/PublicRequestPortal"));

export const AppRoutes = () => (
  <ErrorBoundary>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Index />} />
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
        <Route path="/cmms-cost-calculator" element={<CostCalculatorPage />} />

        <Route path="/r/:slug" element={<PublicRequestPortal />} />

        {PROTECTED_ROUTES.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute><Component /></ProtectedRoute>}
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);
