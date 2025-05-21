
import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const LoadingDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [showResetButton, setShowResetButton] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Show reset button after 5 seconds of loading (reduced from 10)
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setShowResetButton(true);
    }, 5000);
    
    // Show error message after 15 seconds
    const errorTimer = setTimeout(() => {
      setShowErrorMessage(true);
    }, 15000);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(errorTimer);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 rounded-lg bg-white shadow-md max-w-md w-full">
        <Loader2 className="h-12 w-12 animate-spin text-maintenease-600 mx-auto" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your profile...</p>
        <p className="mt-2 text-sm text-gray-500">This should only take a moment</p>
        
        {showResetButton && (
          <div className="mt-6">
            <p className="text-sm text-amber-600 mb-2">Taking longer than expected?</p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleResetToProfile}
                className="w-full"
              >
                Go to profile page
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="w-full"
              >
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
              There might be an issue with your profile data. Try the options above or sign out and back in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
