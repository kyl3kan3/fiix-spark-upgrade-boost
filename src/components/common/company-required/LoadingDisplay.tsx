
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LoadingDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [showResetButton, setShowResetButton] = useState(false);

  // Show reset button after 10 seconds of loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResetButton(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleResetToProfile = () => {
    navigate("/profile");
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
            <Button 
              variant="outline" 
              onClick={handleResetToProfile}
              className="mt-2"
            >
              Go to profile page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
