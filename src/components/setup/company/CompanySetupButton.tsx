
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CompanySetupButtonProps {
  isSubmitting?: boolean;
}

const CompanySetupButton: React.FC<CompanySetupButtonProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();

  const handleCompanySetup = () => {
    // Force setup mode by adding the forceSetup parameter 
    navigate('/setup?forceSetup=true&timestamp=' + Date.now());
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
