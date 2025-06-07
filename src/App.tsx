
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import VendorFormPage from "./pages/VendorFormPage";
import AssetsPage from "./pages/AssetsPage";
import AssetFormPage from "./pages/AssetFormPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import WorkOrderDetailsPage from "./pages/WorkOrderDetailsPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import OrganizationPage from "./pages/OrganizationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
            <Route path="/work-orders/:workOrderId" element={
              <ProtectedRoute>
                <WorkOrderDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/work-orders/:workOrderId/edit" element={
              <ProtectedRoute>
                <WorkOrderFormPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/organization" element={
              <ProtectedRoute>
                <OrganizationPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
