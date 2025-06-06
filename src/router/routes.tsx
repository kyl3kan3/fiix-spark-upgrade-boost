import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompanyRequiredWrapper from "@/components/common/CompanyRequiredWrapper";

// Public pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";
import OnboardingPage from "@/pages/OnboardingPage";
import SetupPage from "@/pages/SetupPage";
import CompanySetup from "@/pages/CompanySetup";
import TeamSetup from "@/pages/TeamSetup";
import Team from "@/pages/Team";
import Help from "@/pages/Help";
import FeatureDemoPage from "@/pages/FeatureDemoPage";

// Feature pages
import WorkOrdersPage from "@/pages/WorkOrdersPage";
import WorkOrderFormPage from "@/pages/WorkOrderFormPage";
import WorkOrderDetailPage from "@/pages/WorkOrderDetailPage";
import AssetsPage from "@/pages/AssetsPage";
import AssetFormPage from "@/pages/AssetFormPage";
import LocationsPage from "@/pages/LocationsPage";
import InspectionsPage from "@/pages/InspectionsPage";
import NewInspectionPage from "@/pages/NewInspectionPage";
import InspectionDetailPage from "@/pages/InspectionDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import Calendar from "@/pages/Calendar";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import VendorsPage from "@/pages/VendorsPage";
import VendorFormPage from "@/pages/VendorFormPage";
import VendorImportPage from "@/pages/VendorImportPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <Dashboard />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      
      <Route path="/setup" element={
        <ProtectedRoute>
          <SetupPage />
        </ProtectedRoute>
      } />
      
      <Route path="/company-setup" element={
        <ProtectedRoute>
          <CompanySetup />
        </ProtectedRoute>
      } />
      
      <Route path="/team-setup" element={
        <ProtectedRoute>
          <TeamSetup />
        </ProtectedRoute>
      } />
      
      <Route path="/team" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <Team />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <WorkOrdersPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/new" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <WorkOrderFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/edit/:workOrderId" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <WorkOrderFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/:workOrderId" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <WorkOrderDetailPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/assets" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <AssetsPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/assets/new" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <AssetFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/assets/edit/:assetId" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <AssetFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/locations" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <LocationsPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/inspections" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <InspectionsPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/inspections/new" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <NewInspectionPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/inspections/:inspectionId" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <InspectionDetailPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <ReportsPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <Calendar />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/chat" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <Chat />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/help" element={
        <ProtectedRoute>
          <Help />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <Settings />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/features/:feature" element={
        <ProtectedRoute>
          <FeatureDemoPage />
        </ProtectedRoute>
      } />
      
      <Route path="/vendors" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <VendorsPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors/new" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <VendorFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors/edit/:vendorId" element={
        <ProtectedRoute>
          <CompanyRequiredWrapper>
            <VendorFormPage />
          </CompanyRequiredWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/vendor-import" element={<VendorImportPage />} />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
