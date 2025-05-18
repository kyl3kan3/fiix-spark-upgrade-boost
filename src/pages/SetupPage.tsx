
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
import { supabase } from "@/integrations/supabase/client";

const SetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [forceSetupMode, setForceSetupMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if URL has a forceSetup parameter
  useEffect(() => {
    const forceSetup = searchParams.get('forceSetup');
    if (forceSetup === 'true') {
      console.log("Force setup mode activated");
      setForceSetupMode(true);
      
      // Clear setup flag in localStorage when force setup is enabled
      localStorage.removeItem('maintenease_setup_complete');
    }
  }, [searchParams]);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Auth error in setup page:", error);
          setIsAuthenticated(false);
          // Redirect to auth if not authenticated
          navigate('/auth');
          return;
        }
        
        setIsAuthenticated(!!data.user);
        if (!data.user) {
          console.log("No authenticated user found in setup page, redirecting to auth");
          navigate('/auth');
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsAuthenticated(false);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Check if setup has been completed
  useEffect(() => {
    const checkSetupStatus = async () => {
      if (isAuthenticated === null) return; // Wait for auth check
      
      setIsLoading(true);
      try {
        if (forceSetupMode) {
          console.log("Force setup mode active, bypassing setup completion check");
          setShowWelcomeBack(false);
        } else {
          const setupComplete = await isSetupCompleted();
          
          if (setupComplete) {
            setShowWelcomeBack(true);
            toast.info("Setup has already been completed. You can edit your settings here.");
          } else {
            console.log("Setup not completed");
            setShowWelcomeBack(false);
          }
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      checkSetupStatus();
    }
  }, [navigate, forceSetupMode, isAuthenticated]);

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
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Checking authentication</AlertTitle>
            <AlertDescription>
              Please wait while we check your authentication status...
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }
  
  // If not authenticated, we'll redirect in the useEffect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {showWelcomeBack && !isLoading && !forceSetupMode && (
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
