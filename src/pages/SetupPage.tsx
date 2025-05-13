
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
    const setupComplete = localStorage.getItem('maintenease_setup_complete');
    
    if (setupComplete === 'true') {
      toast.info("Setup has already been completed. You can edit your settings here.");
    }
    
    // Log setup data for debugging
    const setupData = localStorage.getItem('maintenease_setup');
    if (setupData) {
      console.log("Setup data exists in localStorage");
    } else {
      console.log("No setup data found in localStorage");
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
