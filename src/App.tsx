
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import CompanyRequiredWrapper from "@/components/common/CompanyRequiredWrapper";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import AssetsPage from "./pages/AssetsPage";
import AssetFormPage from "./pages/AssetFormPage";
import InspectionsPage from "./pages/InspectionsPage";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import NewInspectionPage from "./pages/NewInspectionPage";
import Calendar from "./pages/Calendar";
import ReportsPage from "./pages/ReportsPage";
import Chat from "./pages/Chat";
import LocationsPage from "./pages/LocationsPage";
import Team from "./pages/Team";
import Help from "./pages/Help";
import CompanySetup from "./pages/CompanySetup";
import SetupPage from "./pages/SetupPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Dashboard />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <ProfilePage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Settings />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/work-orders"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <WorkOrdersPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/work-orders/:id"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <WorkOrderDetailPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/work-orders/new"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <WorkOrderFormPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/assets"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <AssetsPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/assets/new"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <AssetFormPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/inspections"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <InspectionsPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/inspections/:id"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <InspectionDetailPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/inspections/new"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <NewInspectionPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/calendar"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Calendar />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <ReportsPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Chat />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/locations"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <LocationsPage />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/team"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Team />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/help"
            element={
              <AuthGuard>
                <CompanyRequiredWrapper>
                  <Help />
                </CompanyRequiredWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/setup"
            element={
              <AuthGuard>
                <SetupPage />
              </AuthGuard>
            }
          />
          <Route
            path="/company-setup"
            element={
              <AuthGuard>
                <CompanySetup />
              </AuthGuard>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
