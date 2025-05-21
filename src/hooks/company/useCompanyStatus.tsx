
import { useEffect } from "react";
import { useCompanyAuthentication } from "./useCompanyAuthentication";
import { useCompanyProfile } from "./useCompanyProfile";
import { useCompanySetupStatus } from "./useCompanySetupStatus";
import { useCompanyFoundHandler } from "./useCompanyFoundHandler";

/**
 * Hook that manages the overall company status including auth, profile, and setup status
 */
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

  const { handleCompanyFound } = useCompanyFoundHandler(setSetupComplete);

  // Combined loading state
  const isLoading = isAuthLoading || isProfileLoading;

  /**
   * Refresh all company status data
   */
  const refreshCompanyStatus = async () => {
    // First refresh auth status
    await refreshAuthStatus();
    
    // If authenticated, check profile and setup status
    if (isAuthenticated) {
      await refreshProfileStatus();
      refreshSetupStatus();
      
      // If we have a company ID but setup is not marked as complete, update it
      if (companyId && !setupComplete) {
        setSetupComplete(true);
      }
    }
  };

  // Initial load
  useEffect(() => {
    refreshCompanyStatus();
  }, []);

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
