
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthPage from "./pages/AuthPage";
import CompanySetup from "./pages/CompanySetup";
import TeamSetup from "./pages/TeamSetup";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/auth/AuthGuard";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import AssetsPage from "./pages/AssetsPage";
import InspectionsPage from "./pages/InspectionsPage";
import Calendar from "./pages/Calendar";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth-old" element={<Auth />} />
        <Route path="/invite/*" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/company-setup" element={
          <AuthGuard>
            <CompanySetup />
          </AuthGuard>
        } />
        <Route path="/team-setup" element={
          <AuthGuard>
            <TeamSetup />
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />

        {/* Work Orders routes */}
        <Route path="/work-orders" element={
          <AuthGuard>
            <WorkOrdersPage />
          </AuthGuard>
        } />
        <Route path="/work-orders/new" element={
          <AuthGuard>
            <WorkOrderFormPage />
          </AuthGuard>
        } />
        <Route path="/work-orders/:id" element={
          <AuthGuard>
            <WorkOrderDetailPage />
          </AuthGuard>
        } />

        {/* Asset routes */}
        <Route path="/assets" element={
          <AuthGuard>
            <AssetsPage />
          </AuthGuard>
        } />
        
        {/* Inspections routes */}
        <Route path="/inspections" element={
          <AuthGuard>
            <InspectionsPage />
          </AuthGuard>
        } />
        
        {/* Calendar route */}
        <Route path="/calendar" element={
          <AuthGuard>
            <Calendar />
          </AuthGuard>
        } />
        
        {/* Reports route */}
        <Route path="/reports" element={
          <AuthGuard>
            <ReportsPage />
          </AuthGuard>
        } />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
