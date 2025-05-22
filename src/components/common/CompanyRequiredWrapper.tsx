
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyStatus } from "@/hooks/company/useCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";
import { useAuth } from "@/hooks/useAuth"; // Use our refactored auth hook

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);
  const { isAuthenticated, user } = useAuth(); // Get auth state directly
  const {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound
  } = useCompanyStatus();

  // Check authentication once on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      console.log("User not authenticated, redirecting to auth page");
      navigate("/auth");
    } else if (isAuthenticated === true) {
      console.log("User is authenticated:", user?.id);
      refreshCompanyStatus();
    }
    
    setCheckComplete(isAuthenticated !== null);
  }, [isAuthenticated, user, navigate, refreshCompanyStatus]);

  // If authentication check is not complete, show loading
  if (!checkComplete || isAuthenticated === null) {
    return <LoadingDisplay message="Checking authentication..." />;
  }

  // If not authenticated, navigation should have already happened
  if (!isAuthenticated) {
    return <LoadingDisplay message="Redirecting to login..." />;
  }

  // If company is being loaded, show loading
  if (isLoading) {
    return <LoadingDisplay message="Loading company information..." />;
  }

  // If company setup is not complete, show setup required
  if (!setupComplete || !companyId) {
    console.log("Company setup not complete or company ID missing");
    return (
      <SetupRequiredDisplay
        profileError={profileError}
        onCompanyFound={handleCompanyFound}
        onProfileFixed={() => refreshCompanyStatus()}
      />
    );
  }

  // Company setup is complete, render children
  return <>{children}</>;
};

export default CompanyRequiredWrapper;
