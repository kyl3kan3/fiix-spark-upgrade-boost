
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
    
    // Clear any existing setup flags to start fresh
    localStorage.removeItem('maintenease_setup_complete');
    
    toast.info("Starting company setup process");
    
    // Force setup mode by adding the forceSetup parameter with a unique timestamp
    const timestamp = Date.now();
    navigate(`/setup?forceSetup=true&timestamp=${timestamp}`);
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
