
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import SetupPage from "./pages/SetupPage";
import CompanySetup from "./pages/CompanySetup";
import TeamSetup from "./pages/TeamSetup";
import Team from "./pages/Team";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import AssetsPage from "./pages/AssetsPage";
import AssetFormPage from "./pages/AssetFormPage";
import LocationsPage from "./pages/LocationsPage";
import InspectionsPage from "./pages/InspectionsPage";
import NewInspectionPage from "./pages/NewInspectionPage";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import ReportsPage from "./pages/ReportsPage";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import FeatureDemoPage from "./pages/FeatureDemoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/company-setup" element={<CompanySetup />} />
              <Route path="/team-setup" element={<TeamSetup />} />
              <Route path="/team" element={<Team />} />
              <Route path="/work-orders" element={<WorkOrdersPage />} />
              <Route path="/work-orders/new" element={<WorkOrderFormPage />} />
              <Route path="/work-orders/edit/:workOrderId" element={<WorkOrderFormPage />} />
              <Route path="/work-orders/:workOrderId" element={<WorkOrderDetailPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/assets/new" element={<AssetFormPage />} />
              <Route path="/assets/edit/:assetId" element={<AssetFormPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/inspections" element={<InspectionsPage />} />
              <Route path="/inspections/new" element={<NewInspectionPage />} />
              <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/features/:feature" element={<FeatureDemoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
