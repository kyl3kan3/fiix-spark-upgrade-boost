
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { isSetupCompleted, resetSetupData } from "@/services/setup";
import { supabase } from "@/integrations/supabase/client";

export const useSetupPageState = () => {
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
      if (isAuthenticated === null) return;
      
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

  return {
    showWelcomeBack,
    isLoading,
    isResetting,
    forceSetupMode,
    isAuthenticated,
    handleResetSetup
  };
};
