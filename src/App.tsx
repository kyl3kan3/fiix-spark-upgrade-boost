
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeatureDemoPage from "./pages/FeatureDemoPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Team from "./pages/Team";
import Help from "./pages/Help";
import Calendar from "./pages/Calendar";
import AssetFormPage from "./pages/AssetFormPage";
import AssetsPage from "./pages/AssetsPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import WorkOrderFormPage from "./pages/WorkOrderFormPage";
import ReportsPage from "./pages/ReportsPage";

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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/help" element={<Help />} />
            <Route path="/feature/:featureId" element={<FeatureDemoPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new" element={<AssetFormPage />} />
            <Route path="/assets/edit/:assetId" element={<AssetFormPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/new" element={<WorkOrderFormPage />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetailPage />} />
            <Route path="/work-orders/edit/:workOrderId" element={<WorkOrderFormPage />} />
            <Route path="/reports" element={<ReportsPage />} />
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
