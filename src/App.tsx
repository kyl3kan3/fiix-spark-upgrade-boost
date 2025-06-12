
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
