
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CompanySetupButtonProps {
  isSubmitting?: boolean;
}

const CompanySetupButton: React.FC<CompanySetupButtonProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();

  const handleCompanySetup = () => {
    // Clear any existing setup flags to start fresh
    localStorage.removeItem('maintenease_setup_complete');
    
    // Force setup mode by adding the forceSetup parameter with a unique timestamp
    const timestamp = Date.now();
    navigate(`/setup?forceSetup=true&timestamp=${timestamp}`);
  };

  return (
    <Button
      onClick={handleCompanySetup}
      className="w-full"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Please wait..." : "Complete Company Setup"}
    </Button>
  );
};

export default CompanySetupButton;
