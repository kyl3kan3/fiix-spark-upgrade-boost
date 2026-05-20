import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const VendorsPage = lazy(() => import("@/pages/VendorsPage"));
const VendorFormPage = lazy(() => import("@/pages/VendorFormPage"));
const AssetsPage = lazy(() => import("@/pages/AssetsPage"));
const AssetFormPage = lazy(() => import("@/pages/AssetFormPage"));
const AssetDetailPage = lazy(() => import("@/pages/AssetDetailPage"));
const WorkOrdersPage = lazy(() => import("@/pages/WorkOrdersPage"));
const WorkOrderFormPage = lazy(() => import("@/pages/WorkOrderFormPage"));
const WorkOrderDetailPage = lazy(() => import("@/pages/WorkOrderDetailPage"));
const VendorImportPage = lazy(() => import("@/pages/VendorImportPage"));
const Team = lazy(() => import("@/pages/Team"));
const LocationsPage = lazy(() => import("@/pages/LocationsPage"));
const Settings = lazy(() => import("@/pages/Settings"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const InspectionsPage = lazy(() => import("@/pages/InspectionsPage"));
const NewInspectionPage = lazy(() => import("@/pages/NewInspectionPage"));
const InspectionDetailPage = lazy(() => import("@/pages/InspectionDetailPage"));
const Help = lazy(() => import("@/pages/Help"));
const Chat = lazy(() => import("@/pages/Chat"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SetupPage = lazy(() => import("@/pages/SetupPage"));
const TeamSetup = lazy(() => import("@/pages/TeamSetup"));
const CompanySetup = lazy(() => import("@/pages/CompanySetup"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const LocationDetailPage = lazy(() => import("@/pages/LocationDetailPage"));
const ChecklistsPage = lazy(() => import("@/pages/ChecklistsPage"));
const NewChecklistPage = lazy(() => import("@/pages/NewChecklistPage"));
const ChecklistImportPage = lazy(() => import("@/pages/ChecklistImportPage"));
const EditChecklistPage = lazy(() => import("@/pages/EditChecklistPage"));
const ChecklistDetailPage = lazy(() => import("@/pages/ChecklistDetailPage"));
const ChecklistSubmitPage = lazy(() => import("@/pages/ChecklistSubmitPage"));
const ChecklistSubmissionsPage = lazy(() => import("@/pages/ChecklistSubmissionsPage"));
const DueChecklistsPage = lazy(() => import("@/pages/DueChecklistsPage"));
const AdminEmailLogPage = lazy(() => import("@/pages/AdminEmailLogPage"));
const AdminSeoIndexPage = lazy(() => import("@/pages/AdminSeoIndexPage"));
const MyEmailLogPage = lazy(() => import("@/pages/MyEmailLogPage"));
const NotificationPreferencesPage = lazy(() => import("@/pages/NotificationPreferencesPage"));
const FeatureDemoPage = lazy(() => import("@/pages/FeatureDemoPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const SmsOptIn = lazy(() => import("@/pages/SmsOptIn"));
const LearnIndex = lazy(() => import("@/pages/LearnIndex"));
const LearnArticle = lazy(() => import("@/pages/LearnArticle"));
const SolutionsIndex = lazy(() => import("@/pages/SolutionsIndex"));
const SolutionPage = lazy(() => import("@/pages/SolutionPage"));
const PublicRequestPortal = lazy(() => import("@/pages/PublicRequestPortal"));
const RequestsInboxPage = lazy(() => import("@/pages/RequestsInboxPage"));
const AutomationsPage = lazy(() => import("@/pages/AutomationsPage"));
const ApiKeysPage = lazy(() => import("@/pages/ApiKeysPage"));
const SsoPage = lazy(() => import("@/pages/SsoPage"));

export const AppRoutes = () => (
 <Suspense fallback={null}>
 <Routes>
 <Route path="/" element={<Index />} />
 <Route path="/auth" element={<Auth />} />
 <Route path="/login" element={<Navigate to="/auth" replace />} />
 <Route path="/signup" element={<Navigate to="/auth?signup=true" replace />} />
 <Route path="/feature/:title" element={<FeatureDemoPage />} />
 <Route path="/pricing" element={<PricingPage />} />
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

 <Route path="/r/:slug" element={<PublicRequestPortal />} />
 <Route path="/requests" element={<ProtectedRoute><RequestsInboxPage /></ProtectedRoute>} />

 <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

 <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
 <Route path="/vendors/new" element={<ProtectedRoute><VendorFormPage /></ProtectedRoute>} />
 <Route path="/vendors/import" element={<ProtectedRoute><VendorImportPage /></ProtectedRoute>} />
 <Route path="/vendors/:vendorId/edit" element={<ProtectedRoute><VendorFormPage /></ProtectedRoute>} />

 <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
 <Route path="/assets/new" element={<ProtectedRoute><AssetFormPage /></ProtectedRoute>} />
 <Route path="/assets/:assetId/edit" element={<ProtectedRoute><AssetFormPage /></ProtectedRoute>} />
 <Route path="/assets/:assetId" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />

 <Route path="/work-orders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />
 <Route path="/work-orders/new" element={<ProtectedRoute><WorkOrderFormPage /></ProtectedRoute>} />
 <Route path="/work-orders/:workOrderId/edit" element={<ProtectedRoute><WorkOrderFormPage /></ProtectedRoute>} />
 <Route path="/work-orders/:workOrderId" element={<ProtectedRoute><WorkOrderDetailPage /></ProtectedRoute>} />

 <Route path="/inspections" element={<ProtectedRoute><InspectionsPage /></ProtectedRoute>} />
 <Route path="/inspections/new" element={<ProtectedRoute><NewInspectionPage /></ProtectedRoute>} />
 <Route path="/inspections/:id" element={<ProtectedRoute><InspectionDetailPage /></ProtectedRoute>} />

 <Route path="/checklists" element={<ProtectedRoute><ChecklistsPage /></ProtectedRoute>} />
 <Route path="/checklists/due" element={<ProtectedRoute><DueChecklistsPage /></ProtectedRoute>} />
 <Route path="/checklists/new" element={<ProtectedRoute><NewChecklistPage /></ProtectedRoute>} />
 <Route path="/checklists/import" element={<ProtectedRoute><ChecklistImportPage /></ProtectedRoute>} />
 <Route path="/checklists/:id" element={<ProtectedRoute><ChecklistDetailPage /></ProtectedRoute>} />
 <Route path="/checklists/:id/edit" element={<ProtectedRoute><EditChecklistPage /></ProtectedRoute>} />
 <Route path="/checklists/:id/submit" element={<ProtectedRoute><ChecklistSubmitPage /></ProtectedRoute>} />
 <Route path="/checklists/submissions" element={<ProtectedRoute><ChecklistSubmissionsPage /></ProtectedRoute>} />
 <Route path="/admin/email-log" element={<ProtectedRoute><AdminEmailLogPage /></ProtectedRoute>} />
 <Route path="/admin/seo-index" element={<ProtectedRoute><AdminSeoIndexPage /></ProtectedRoute>} />
 <Route path="/notifications/email-log" element={<ProtectedRoute><MyEmailLogPage /></ProtectedRoute>} />
 <Route path="/settings/notifications" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />

 <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
 <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
 <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
 <Route path="/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
 <Route path="/locations/:id" element={<ProtectedRoute><LocationDetailPage /></ProtectedRoute>} />
 <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
 <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
 <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
 <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
 <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
  <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
  <Route path="/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
  <Route path="/sso" element={<ProtectedRoute><SsoPage /></ProtectedRoute>} />
 <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
 <Route path="/team-setup" element={<ProtectedRoute><TeamSetup /></ProtectedRoute>} />
 <Route path="/company-setup" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
 <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

 <Route path="*" element={<NotFound />} />
 </Routes>
 </Suspense>
);
