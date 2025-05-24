
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUnifiedCompanyStatus } from "@/hooks/company/useUnifiedCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const {
    isLoading,
    isAuthenticated,
    setupComplete,
    companyId,
    error,
    refreshStatus,
    setSetupComplete
  } = useUnifiedCompanyStatus();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCompanyFound = (newCompanyId: string) => {
    setSetupComplete(true);
    refreshStatus();
  };

  // Show loading while checking status
  if (isLoading) {
    return <LoadingDisplay message="Loading company information..." />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <LoadingDisplay message="Redirecting to login..." />;
  }

  // Show setup required if not complete
  if (!setupComplete || !companyId) {
    return (
      <SetupRequiredDisplay
        profileError={error ? new Error(error) : null}
        onCompanyFound={handleCompanyFound}
        onProfileFixed={refreshStatus}
      />
    );
  }

  // Render children if setup is complete
  return <>{children}</>;
};

export default CompanyRequiredWrapper;
