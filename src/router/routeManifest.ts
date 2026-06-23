import type { ComponentType } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";

/**
 * Single source of truth for the authenticated app's pages.
 *
 * Adding a page used to be a 3-place ritual — a lazy import, a <Route>, and
 * (for top-level pages) a nav entry — kept in sync by hand, which is why
 * appRoutes.tsx became one of the most-churned files in the repo. Register the
 * page here once: appRoutes renders every entry inside <ProtectedRoute>, and
 * the route↔nav consistency test (src/router/__tests__/routeManifest.test.ts)
 * asserts every nav link resolves to one of these paths.
 *
 * Public/marketing routes, redirects, and the 404 wildcard stay declared
 * explicitly in appRoutes.tsx — they aren't protected and several need bespoke
 * elements (<Navigate>), so a flat {path, component} list doesn't fit them.
 */
export interface AppRoute {
  path: string;
  component: ComponentType;
}

export const PROTECTED_ROUTES: AppRoute[] = [
  { path: "/requests", component: lazy(() => import("@/pages/RequestsInboxPage")) },
  { path: "/dashboard", component: lazy(() => import("@/pages/Dashboard")) },

  { path: "/vendors", component: lazy(() => import("@/pages/VendorsPage")) },
  { path: "/vendors/new", component: lazy(() => import("@/pages/VendorFormPage")) },
  { path: "/vendors/import", component: lazy(() => import("@/pages/VendorImportPage")) },
  { path: "/vendors/:vendorId/edit", component: lazy(() => import("@/pages/VendorFormPage")) },

  { path: "/assets", component: lazy(() => import("@/pages/AssetsPage")) },
  { path: "/assets/new", component: lazy(() => import("@/pages/AssetFormPage")) },
  { path: "/assets/:assetId/edit", component: lazy(() => import("@/pages/AssetFormPage")) },
  { path: "/assets/:assetId", component: lazy(() => import("@/pages/AssetDetailPage")) },

  { path: "/work-orders", component: lazy(() => import("@/pages/WorkOrdersPage")) },
  { path: "/work-orders/new", component: lazy(() => import("@/pages/WorkOrderFormPage")) },
  { path: "/work-orders/:workOrderId/edit", component: lazy(() => import("@/pages/WorkOrderFormPage")) },
  { path: "/work-orders/:workOrderId", component: lazy(() => import("@/pages/WorkOrderDetailPage")) },

  { path: "/inspections", component: lazy(() => import("@/pages/InspectionsPage")) },
  { path: "/inspections/new", component: lazy(() => import("@/pages/NewInspectionPage")) },
  { path: "/inspections/:id", component: lazy(() => import("@/pages/InspectionDetailPage")) },

  { path: "/checklists", component: lazy(() => import("@/pages/ChecklistsPage")) },
  { path: "/checklists/due", component: lazy(() => import("@/pages/DueChecklistsPage")) },
  { path: "/checklists/new", component: lazy(() => import("@/pages/NewChecklistPage")) },
  { path: "/checklists/import", component: lazy(() => import("@/pages/ChecklistImportPage")) },
  { path: "/checklists/:id", component: lazy(() => import("@/pages/ChecklistDetailPage")) },
  { path: "/checklists/:id/edit", component: lazy(() => import("@/pages/EditChecklistPage")) },
  { path: "/checklists/:id/submit", component: lazy(() => import("@/pages/ChecklistSubmitPage")) },
  { path: "/checklists/submissions", component: lazy(() => import("@/pages/ChecklistSubmissionsPage")) },

  { path: "/admin/email-log", component: lazy(() => import("@/pages/AdminEmailLogPage")) },
  { path: "/admin/seo-index", component: lazy(() => import("@/pages/AdminSeoIndexPage")) },
  { path: "/admin/analytics", component: lazy(() => import("@/pages/AdminAnalyticsPage")) },
  { path: "/notifications/email-log", component: lazy(() => import("@/pages/MyEmailLogPage")) },
  { path: "/settings/notifications", component: lazy(() => import("@/pages/NotificationPreferencesPage")) },

  { path: "/calendar", component: lazy(() => import("@/pages/Calendar")) },
  { path: "/maintenance", component: lazy(() => import("@/pages/MaintenancePage")) },
  { path: "/predictive-maintenance", component: lazy(() => import("@/pages/PredictiveMaintenancePage")) },
  { path: "/self-healing", component: lazy(() => import("@/pages/SelfHealingPage")) },
  { path: "/cost-tracking", component: lazy(() => import("@/pages/CostTrackingPage")) },
  { path: "/onboarding/documents", component: lazy(() => import("@/pages/OnboardingDocumentsPage")) },
  { path: "/power-usage", component: lazy(() => import("@/pages/PowerUsagePage")) },
  { path: "/assistant", component: lazy(() => import("@/pages/AssistantPage")) },
  { path: "/guided-setup", component: lazy(() => import("@/pages/GuidedSetupPage")) },
  { path: "/building-viewer", component: lazy(() => import("@/pages/BuildingViewerPage")) },
  { path: "/import", component: lazy(() => import("@/pages/ImportHubPage")) },
  { path: "/team", component: lazy(() => import("@/pages/Team")) },
  { path: "/locations", component: lazy(() => import("@/pages/LocationsPage")) },
  { path: "/locations/:id", component: lazy(() => import("@/pages/LocationDetailPage")) },
  { path: "/settings", component: lazy(() => import("@/pages/Settings")) },
  { path: "/profile", component: lazy(() => import("@/pages/ProfilePage")) },
  { path: "/help", component: lazy(() => import("@/pages/Help")) },
  { path: "/chat", component: lazy(() => import("@/pages/Chat")) },
  { path: "/reports", component: lazy(() => import("@/pages/ReportsPage")) },
  { path: "/billing", component: lazy(() => import("@/pages/BillingPage")) },
  { path: "/automations", component: lazy(() => import("@/pages/AutomationsPage")) },
  { path: "/api-keys", component: lazy(() => import("@/pages/ApiKeysPage")) },
  { path: "/sso", component: lazy(() => import("@/pages/SsoPage")) },
  { path: "/setup", component: lazy(() => import("@/pages/SetupPage")) },
  { path: "/team-setup", component: lazy(() => import("@/pages/TeamSetup")) },
  { path: "/company-setup", component: lazy(() => import("@/pages/CompanySetup")) },
  { path: "/onboarding", component: lazy(() => import("@/pages/OnboardingPage")) },
];
