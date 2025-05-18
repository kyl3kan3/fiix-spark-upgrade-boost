
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SetupProvider } from "@/components/setup/SetupContext";
import { SetupContainer } from "@/components/setup/SetupContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isSetupCompleted, resetSetupData } from "@/services/setup";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [forceSetupMode, setForceSetupMode] = useState(false);

  // Check if URL has a forceSetup parameter
  useEffect(() => {
    const forceSetup = searchParams.get('forceSetup');
    if (forceSetup) {
      console.log("Force setup mode activated");
      setForceSetupMode(true);
    }
  }, [searchParams]);

  // Check if setup has been completed
  useEffect(() => {
    const checkSetupStatus = async () => {
      setIsLoading(true);
      try {
        const setupComplete = await isSetupCompleted();
        
        if (setupComplete && !forceSetupMode) {
          setShowWelcomeBack(true);
          toast.info("Setup has already been completed. You can edit your settings here.");
        } else {
          console.log("Setup not completed or force mode active");
          setShowWelcomeBack(false);
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSetupStatus();
  }, [navigate, forceSetupMode]);

  const handleResetSetup = async () => {
    setIsResetting(true);
    try {
      await resetSetupData();
      toast.success("Setup data has been reset successfully.");
      
      // Clear the setup flag in localStorage
      localStorage.removeItem('maintenease_setup_complete');
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error resetting setup data:", error);
      toast.error("Failed to reset setup data. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {showWelcomeBack && !isLoading && (
          <div className="flex flex-col gap-6 mb-6">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Welcome back to the setup wizard</AlertTitle>
              <AlertDescription>
                Your system is already set up, but you can make changes to your configuration here.
                Any changes you make will be applied immediately.
              </AlertDescription>
            </Alert>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset Setup Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will reset all your setup data including company information, 
                    user roles, asset categories, and other configuration. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSetup} className="bg-red-600 hover:bg-red-700">
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <SetupProvider>
        <SetupContainer />
      </SetupProvider>
    </DashboardLayout>
  );
};

export default SetupPage;
