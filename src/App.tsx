
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import VendorFormPage from "./pages/VendorFormPage";
import AssetsPage from "./pages/AssetsPage";
import AssetFormPage from "./pages/AssetFormPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import VendorImportPage from "./pages/VendorImportPage";
import Team from "./pages/Team";
import LocationsPage from "./pages/LocationsPage";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import Calendar from "./pages/Calendar";
import MaintenancePage from "./pages/MaintenancePage";
import InspectionsPage from "./pages/InspectionsPage";
import NewInspectionPage from "./pages/NewInspectionPage";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import Help from "./pages/Help";
import Chat from "./pages/Chat";
import ReportsPage from "./pages/ReportsPage";
import SetupPage from "./pages/SetupPage";
import TeamSetup from "./pages/TeamSetup";
import CompanySetup from "./pages/CompanySetup";
import OnboardingPage from "./pages/OnboardingPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import ChecklistsPage from "./pages/ChecklistsPage";
import NewChecklistPage from "./pages/NewChecklistPage";
import EditChecklistPage from "./pages/EditChecklistPage";
import ChecklistDetailPage from "./pages/ChecklistDetailPage";
import ChecklistSubmitPage from "./pages/ChecklistSubmitPage";
import ChecklistSubmissionsPage from "./pages/ChecklistSubmissionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
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
              
              <Route path="/vendors/import" element={
                <ProtectedRoute>
                  <VendorImportPage />
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
              
              <Route path="/checklists" element={
                <ProtectedRoute>
                  <ChecklistsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/checklists/new" element={
                <ProtectedRoute>
                  <NewChecklistPage />
                </ProtectedRoute>
              } />
              
              <Route path="/checklists/:id" element={
                <ProtectedRoute>
                  <ChecklistDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/checklists/:id/edit" element={
                <ProtectedRoute>
                  <EditChecklistPage />
                </ProtectedRoute>
              } />
              
              <Route path="/checklists/:id/submit" element={
                <ProtectedRoute>
                  <ChecklistSubmitPage />
                </ProtectedRoute>
              } />
              
              <Route path="/checklists/submissions" element={
                <ProtectedRoute>
                  <ChecklistSubmissionsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              
              <Route path="/maintenance" element={
                <ProtectedRoute>
                  <MaintenancePage />
                </ProtectedRoute>
              } />
              
              <Route path="/team" element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } />
              
              <Route path="/locations" element={
                <ProtectedRoute>
                  <LocationsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
