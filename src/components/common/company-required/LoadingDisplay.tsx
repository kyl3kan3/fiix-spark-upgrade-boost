
import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const LoadingDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [showResetButton, setShowResetButton] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  // Show reset button after 3 seconds of loading (reduced from 5)
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setShowResetButton(true);
    }, 3000);
    
    // Show error message after 8 seconds (reduced from 15)
    const errorTimer = setTimeout(() => {
      setShowErrorMessage(true);
    }, 8000);

    // Track loading time for feedback
    const intervalId = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(errorTimer);
      clearInterval(intervalId);
    };
  }, []);

  const handleResetToProfile = () => {
    navigate("/profile");
    toast.info("Redirected to profile page");
  };

  const handleRetry = () => {
    localStorage.removeItem('maintenease_setup_complete');
    localStorage.removeItem('maintenease_setup');
    toast.info("Cleared setup data, refreshing page...");
    window.location.reload();
  };

  const handleHardReset = async () => {
    try {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear supabase session
      await supabase.auth.signOut();
      
      toast.info("Complete reset performed, redirecting to login...");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    } catch (error) {
      console.error("Error during hard reset:", error);
      toast.error("Reset failed. Please try again or refresh the page manually.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 rounded-lg bg-white shadow-md max-w-md w-full">
        <Loader2 className="h-12 w-12 animate-spin text-maintenease-600 mx-auto" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your profile...</p>
        <p className="mt-2 text-sm text-gray-500">This has been loading for {loadingTime} seconds</p>
        
        {showResetButton && (
          <div className="mt-6">
            <p className="text-sm text-amber-600 mb-2">Taking longer than expected?</p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleResetToProfile}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Go to profile page
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry with clean setup
              </Button>
            </div>
          </div>
        )}

        {showErrorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700 font-medium">Loading problem detected</p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              There might be an issue with your profile data. Try the options above or perform a complete reset.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleHardReset}
              className="w-full mt-3"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out & Reset All Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
