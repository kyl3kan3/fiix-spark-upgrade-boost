
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
import Auth from '@/pages/Auth';
import Help from '@/pages/Help';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/OnboardingPage';
import SetupPage from '@/pages/SetupPage';

// Component to enforce company requirement
import CompanyRequiredWrapper from '@/components/common/CompanyRequiredWrapper';

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        
        {/* Protected routes that require company setup */}
        <Route path="/dashboard" element={
          <CompanyRequiredWrapper>
            <Dashboard />
          </CompanyRequiredWrapper>
        } />
        <Route path="/profile" element={
          <CompanyRequiredWrapper>
            <ProfilePage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/team" element={
          <CompanyRequiredWrapper>
            <Team />
          </CompanyRequiredWrapper>
        } />
        <Route path="/features" element={
          <CompanyRequiredWrapper>
            <FeatureDemoPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/work-orders" element={
          <CompanyRequiredWrapper>
            <WorkOrdersPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/work-orders/:id" element={
          <CompanyRequiredWrapper>
            <WorkOrderDetailPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/work-orders/new" element={
          <CompanyRequiredWrapper>
            <WorkOrderFormPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/work-orders/edit/:id" element={
          <CompanyRequiredWrapper>
            <WorkOrderFormPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/assets" element={
          <CompanyRequiredWrapper>
            <AssetsPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/assets/new" element={
          <CompanyRequiredWrapper>
            <AssetFormPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/assets/edit/:id" element={
          <CompanyRequiredWrapper>
            <AssetFormPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/locations" element={
          <CompanyRequiredWrapper>
            <LocationsPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/reports" element={
          <CompanyRequiredWrapper>
            <ReportsPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/inspections" element={
          <CompanyRequiredWrapper>
            <InspectionsPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/inspections/new" element={
          <CompanyRequiredWrapper>
            <NewInspectionPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/inspections/:id" element={
          <CompanyRequiredWrapper>
            <InspectionDetailPage />
          </CompanyRequiredWrapper>
        } />
        <Route path="/chat" element={
          <CompanyRequiredWrapper>
            <Chat />
          </CompanyRequiredWrapper>
        } />
        <Route path="/calendar" element={
          <CompanyRequiredWrapper>
            <Calendar />
          </CompanyRequiredWrapper>
        } />
        <Route path="/settings" element={
          <CompanyRequiredWrapper>
            <Settings />
          </CompanyRequiredWrapper>
        } />
        <Route path="/help" element={
          <CompanyRequiredWrapper>
            <Help />
          </CompanyRequiredWrapper>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
