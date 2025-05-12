
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SetupProvider } from "@/components/setup/SetupContext";
import { SetupContainer } from "@/components/setup/SetupContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const SetupPage = () => {
  const navigate = useNavigate();

  // Check if setup has been completed
  useEffect(() => {
    const setupData = localStorage.getItem('maintenease_setup');
    const setupComplete = localStorage.getItem('maintenease_setup_complete');
    
    if (setupComplete === 'true') {
      toast.info("Setup has already been completed.");
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <BackToDashboard />
      <SetupProvider>
        <SetupContainer />
      </SetupProvider>
    </DashboardLayout>
  );
};

export default SetupPage;
