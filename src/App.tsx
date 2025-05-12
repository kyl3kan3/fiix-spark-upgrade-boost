import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeatureDemoPage from "./pages/FeatureDemoPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import SetupPage from "./pages/SetupPage"; 
import Team from "./pages/Team";
import Help from "./pages/Help";
import Calendar from "./pages/Calendar";
import AssetFormPage from "./pages/AssetFormPage";
import AssetsPage from "./pages/AssetsPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import ReportsPage from "./pages/ReportsPage";
import InspectionsPage from "./pages/InspectionsPage";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import NewInspectionPage from "./pages/NewInspectionPage";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      () => setSessionChecked(true)
    );
    
    // Initial session check
    const checkSession = async () => {
      await supabase.auth.getSession();
      setSessionChecked(true);
    };
    
    checkSession();
    
    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  if (!sessionChecked) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            {/* Changed the root path to go directly to Auth */}
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="/landing" element={<Index />} /> {/* Keep the original Index as /landing */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/help" element={<Help />} />
            <Route path="/chat" element={<Chat />} />
            {/* Keep the feature demo routes, just not on the main path */}
            <Route path="/feature/:featureId" element={<FeatureDemoPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new" element={<AssetFormPage />} />
            <Route path="/assets/edit/:assetId" element={<AssetFormPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/new" element={<WorkOrderFormPage />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetailPage />} />
            <Route path="/work-orders/edit/:workOrderId" element={<WorkOrderFormPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/inspections" element={<InspectionsPage />} />
            <Route path="/inspections/new" element={<NewInspectionPage />} />
            <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
