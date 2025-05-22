
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/ProfilePage';
import Team from '@/pages/Team';
import FeatureDemoPage from '@/pages/FeatureDemoPage';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import WorkOrderDetailPage from '@/pages/WorkOrderDetailPage';
import WorkOrderFormPage from '@/pages/WorkOrderFormPage';
import AssetsPage from '@/pages/AssetsPage';
import AssetFormPage from '@/pages/AssetFormPage';
import LocationsPage from '@/pages/LocationsPage';
import ReportsPage from '@/pages/ReportsPage';
import InspectionsPage from '@/pages/InspectionsPage';
import NewInspectionPage from '@/pages/NewInspectionPage';
import InspectionDetailPage from '@/pages/InspectionDetailPage';
import Chat from '@/pages/Chat';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import AuthPage from '@/pages/AuthPage';
import Help from '@/pages/Help';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/OnboardingPage';
import SetupPage from '@/pages/SetupPage';

// Component to enforce authentication
import AuthGuard from '@/components/auth/AuthGuard';

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        
        {/* Protected routes that require authentication */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        } />
        <Route path="/team" element={
          <AuthGuard>
            <Team />
          </AuthGuard>
        } />
        <Route path="/features" element={
          <AuthGuard>
            <FeatureDemoPage />
          </AuthGuard>
        } />
        <Route path="/work-orders" element={
          <AuthGuard>
            <WorkOrdersPage />
          </AuthGuard>
        } />
        <Route path="/work-orders/:id" element={
          <AuthGuard>
            <WorkOrderDetailPage />
          </AuthGuard>
        } />
        <Route path="/work-orders/new" element={
          <AuthGuard>
            <WorkOrderFormPage />
          </AuthGuard>
        } />
        <Route path="/work-orders/edit/:id" element={
          <AuthGuard>
            <WorkOrderFormPage />
          </AuthGuard>
        } />
        <Route path="/assets" element={
          <AuthGuard>
            <AssetsPage />
          </AuthGuard>
        } />
        <Route path="/assets/new" element={
          <AuthGuard>
            <AssetFormPage />
          </AuthGuard>
        } />
        <Route path="/assets/edit/:id" element={
          <AuthGuard>
            <AssetFormPage />
          </AuthGuard>
        } />
        <Route path="/locations" element={
          <AuthGuard>
            <LocationsPage />
          </AuthGuard>
        } />
        <Route path="/reports" element={
          <AuthGuard>
            <ReportsPage />
          </AuthGuard>
        } />
        <Route path="/inspections" element={
          <AuthGuard>
            <InspectionsPage />
          </AuthGuard>
        } />
        <Route path="/inspections/new" element={
          <AuthGuard>
            <NewInspectionPage />
          </AuthGuard>
        } />
        <Route path="/inspections/:id" element={
          <AuthGuard>
            <InspectionDetailPage />
          </AuthGuard>
        } />
        <Route path="/chat" element={
          <AuthGuard>
            <Chat />
          </AuthGuard>
        } />
        <Route path="/calendar" element={
          <AuthGuard>
            <Calendar />
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <Settings />
          </AuthGuard>
        } />
        <Route path="/help" element={
          <AuthGuard>
            <Help />
          </AuthGuard>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
