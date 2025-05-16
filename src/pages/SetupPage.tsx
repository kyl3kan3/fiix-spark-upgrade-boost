
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SetupProvider } from "@/components/setup/SetupContext";
import { SetupContainer } from "@/components/setup/SetupContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isSetupCompleted } from "@/services/setupService";

const SetupPage = () => {
  const navigate = useNavigate();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if setup has been completed
  useEffect(() => {
    const checkSetupStatus = async () => {
      setIsLoading(true);
      try {
        const setupComplete = await isSetupCompleted();
        
        if (setupComplete) {
          setShowWelcomeBack(true);
          toast.info("Setup has already been completed. You can edit your settings here.");
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSetupStatus();
  }, [navigate]);

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      {showWelcomeBack && !isLoading && (
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mb-6">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Welcome back to the setup wizard</AlertTitle>
            <AlertDescription>
              Your system is already set up, but you can make changes to your configuration here.
              Any changes you make will be applied immediately.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <SetupProvider>
        <SetupContainer />
      </SetupProvider>
    </DashboardLayout>
  );
};

export default SetupPage;
