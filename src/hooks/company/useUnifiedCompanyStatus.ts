
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfile } from "@/hooks/profile/useProfile";
import { useSetupStatus } from "./useSetupStatus";
import { useCompanyStatusRefresh } from "./useCompanyStatusRefresh";

interface UnifiedCompanyStatus {
  isLoading: boolean;
  isAuthenticated: boolean;
  setupComplete: boolean;
  companyId: string | null;
  error: string | null;
  refreshStatus: () => Promise<void>;
  setSetupComplete: (complete: boolean) => void;
}

export function useUnifiedCompanyStatus(): UnifiedCompanyStatus {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const { setupComplete, setSetupComplete } = useSetupStatus();
  const { error, setError, refreshStatus } = useCompanyStatusRefresh();

  // Update setup status when profile data changes
  useEffect(() => {
    if (profileData?.company_id && setupComplete === false) {
      setSetupComplete(true);
    }
  }, [profileData?.company_id, setupComplete, setSetupComplete]);

  // Handle errors
  useEffect(() => {
    if (profileError) {
      setError(profileError);
    } else {
      setError(null);
    }
  }, [profileError, setError]);

  const isLoading = authLoading || profileLoading || setupComplete === null;
  const actualSetupComplete = setupComplete === true && !!profileData?.company_id;

  return {
    isLoading,
    isAuthenticated: !!isAuthenticated,
    setupComplete: actualSetupComplete,
    companyId: profileData?.company_id || null,
    error,
    refreshStatus,
    setSetupComplete
  };
}
