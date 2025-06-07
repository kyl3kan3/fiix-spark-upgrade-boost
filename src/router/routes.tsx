
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import VendorsPage from "@/pages/VendorsPage";
import VendorFormPage from "@/pages/VendorFormPage";
import AssetsPage from "@/pages/AssetsPage";
import AssetFormPage from "@/pages/AssetFormPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";
import WorkOrderFormPage from "@/pages/WorkOrderFormPage";
import ProfilePage from "@/pages/ProfilePage";
import Team from "@/pages/Team";
import Help from "@/pages/Help";
import Calendar from "@/pages/Calendar";
import Chat from "@/pages/Chat";
import InspectionsPage from "@/pages/InspectionsPage";
import NewInspectionPage from "@/pages/NewInspectionPage";
import InspectionDetailPage from "@/pages/InspectionDetailPage";
import LocationsPage from "@/pages/LocationsPage";
import ReportsPage from "@/pages/ReportsPage";
import SetupPage from "@/pages/SetupPage";
import TeamSetup from "@/pages/TeamSetup";
import CompanySetup from "@/pages/CompanySetup";
import OnboardingPage from "@/pages/OnboardingPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/signup" element={<Navigate to="/auth?signup=true" replace />} />
    
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/vendors" element={
      <ProtectedRoute>
        <VendorsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/vendors/new" element={
      <ProtectedRoute>
        <VendorFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/vendors/:vendorId/edit" element={
      <ProtectedRoute>
        <VendorFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/assets" element={
      <ProtectedRoute>
        <AssetsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/assets/new" element={
      <ProtectedRoute>
        <AssetFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/assets/:assetId/edit" element={
      <ProtectedRoute>
        <AssetFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/work-orders" element={
      <ProtectedRoute>
        <WorkOrdersPage />
      </ProtectedRoute>
    } />
    
    <Route path="/work-orders/new" element={
      <ProtectedRoute>
        <WorkOrderFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/work-orders/:workOrderId/edit" element={
      <ProtectedRoute>
        <WorkOrderFormPage />
      </ProtectedRoute>
    } />
    
    <Route path="/profile" element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    } />
    
    <Route path="/team" element={
      <ProtectedRoute>
        <Team />
      </ProtectedRoute>
    } />
    
    <Route path="/help" element={
      <ProtectedRoute>
        <Help />
      </ProtectedRoute>
    } />
    
    <Route path="/calendar" element={
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    } />
    
    <Route path="/chat" element={
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    } />
    
    <Route path="/inspections" element={
      <ProtectedRoute>
        <InspectionsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/inspections/new" element={
      <ProtectedRoute>
        <NewInspectionPage />
      </ProtectedRoute>
    } />
    
    <Route path="/inspections/:id" element={
      <ProtectedRoute>
        <InspectionDetailPage />
      </ProtectedRoute>
    } />
    
    <Route path="/locations" element={
      <ProtectedRoute>
        <LocationsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/reports" element={
      <ProtectedRoute>
        <ReportsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/setup" element={
      <ProtectedRoute>
        <SetupPage />
      </ProtectedRoute>
    } />
    
    <Route path="/team-setup" element={
      <ProtectedRoute>
        <TeamSetup />
      </ProtectedRoute>
    } />
    
    <Route path="/company-setup" element={
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    } />
    
    <Route path="/onboarding" element={
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    } />
    
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
