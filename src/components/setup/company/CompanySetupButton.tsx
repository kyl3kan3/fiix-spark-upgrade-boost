
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CompanySetupButtonProps {
  isSubmitting?: boolean;
}

const CompanySetupButton: React.FC<CompanySetupButtonProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCompanySetup = () => {
    if (isNavigating) return; // Prevent multiple clicks
    
    setIsNavigating(true);
    
    try {
      // Clear any existing setup flags to start fresh
      localStorage.removeItem('maintenease_setup_complete');
      
      toast.info("Starting company setup process");
      
      // Force setup mode by adding the forceSetup parameter with a unique timestamp
      const timestamp = Date.now();
      // Use window.location for a full page reload to reset any stale state
      window.location.href = `/setup?forceSetup=true&timestamp=${timestamp}`;
    } catch (error) {
      console.error("Error navigating to setup:", error);
      setIsNavigating(false);
      toast.error("Failed to navigate to setup page");
    }
  };

  return (
    <Button
      onClick={handleCompanySetup}
      className="w-full"
      disabled={isSubmitting || isNavigating}
    >
      {isSubmitting || isNavigating ? "Please wait..." : "Complete Company Setup"}
    </Button>
  );
};

export default CompanySetupButton;
