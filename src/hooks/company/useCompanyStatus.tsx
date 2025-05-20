
import { useEffect } from "react";
import { useCompanyAuthentication } from "./useCompanyAuthentication";
import { useCompanyProfile } from "./useCompanyProfile";
import { useCompanySetupStatus } from "./useCompanySetupStatus";
import { toast } from "sonner";

export function useCompanyStatus() {
  const {
    isLoading: isAuthLoading, 
    isAuthenticated, 
    profileError: authError, 
    refreshAuthStatus
  } = useCompanyAuthentication();
  
  const {
    isLoading: isProfileLoading, 
    companyId, 
    profileError,
    loadProfileData,
    refreshProfileStatus
  } = useCompanyProfile();
  
  const {
    setupComplete, 
    checkSetupCompleted, 
    setSetupComplete,
    refreshSetupStatus
  } = useCompanySetupStatus();

  // Combined loading state
  const isLoading = isAuthLoading || isProfileLoading;

  const refreshCompanyStatus = async () => {
    // Reset state for refresh
    console.log("Refreshing company status");
    
    // First refresh auth status
    await refreshAuthStatus();
    
    // If authenticated, check profile and setup status
    if (isAuthenticated) {
      await refreshProfileStatus();
      refreshSetupStatus();
      
      // If we have a company ID but setup is not marked as complete, update it
      if (companyId && !setupComplete) {
        setSetupComplete(true);
        console.log("Setup marked as complete because company ID exists in profile");
      }
    }
  };

  // Initial load
  useEffect(() => {
    console.log("Initial load of company status");
    refreshCompanyStatus();
  }, []);

  const handleCompanyFound = (newCompanyId: string) => {
    setSetupComplete(true);
    console.log("Company found and setup marked complete:", newCompanyId);
    
    toast.success("Company setup completed");
    
    // Force refresh the page after a short delay to ensure all state is updated
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return {
    isLoading,
    profileError: profileError || authError,
    setupComplete,
    companyId,
    isAuthenticated,
    refreshCompanyStatus,
    handleCompanyFound
  };
}
