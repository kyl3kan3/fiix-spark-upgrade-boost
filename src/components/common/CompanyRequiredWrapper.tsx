
import React, { useEffect } from "react";
import { useCompanyStatus } from "@/hooks/company/useCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound
  } = useCompanyStatus();

  // Check database status on mount
  useEffect(() => {
    refreshCompanyStatus();
  }, [refreshCompanyStatus]);

  // Wait for both profile data and setup check to complete
  if (isLoading) {
    return <LoadingDisplay />;
  }

  // Debug log to help track the issue
  console.log("CompanyRequiredWrapper state:", { 
    setupComplete, 
    hasCompanyId: !!companyId, 
    companyId
  });

  // If we have a company_id, always allow access
  if (companyId) {
    console.log("Company ID exists, allowing access");
    
    // Auto-mark setup as complete if we have a company ID
    if (!setupComplete) {
      localStorage.setItem('maintenease_setup_complete', 'true');
      console.log("Setup marked as complete because company ID exists");
    }
    
    return <>{children}</>;
  }

  // If setup is explicitly marked as complete, allow access
  if (setupComplete === true) {
    console.log("Setup is marked as complete, allowing access");
    return <>{children}</>;
  }

  // Otherwise show the setup required page
  return (
    <SetupRequiredDisplay
      profileError={profileError}
      onCompanyFound={handleCompanyFound}
      onProfileFixed={refreshCompanyStatus}
    />
  );
};

export default CompanyRequiredWrapper;
