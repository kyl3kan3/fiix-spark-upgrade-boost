
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
