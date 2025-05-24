
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useProfile } from "@/hooks/profile/useProfile";

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
  const [setupComplete, setSetupCompleteState] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check setup status from localStorage
  const checkSetupStatus = useCallback(() => {
    const stored = localStorage.getItem('maintenease_setup_complete');
    return stored === 'true';
  }, []);

  // Update setup status
  const setSetupComplete = useCallback((complete: boolean) => {
    localStorage.setItem('maintenease_setup_complete', complete ? 'true' : 'false');
    setSetupCompleteState(complete);
  }, []);

  // Initialize setup status
  useEffect(() => {
    const isComplete = checkSetupStatus();
    setSetupCompleteState(isComplete);
  }, [checkSetupStatus]);

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
  }, [profileError]);

  // Refresh all status
  const refreshStatus = useCallback(async () => {
    try {
      setError(null);
      const isComplete = checkSetupStatus();
      setSetupCompleteState(isComplete);
      
      // Profile data will be refreshed by useProfile hook
    } catch (err) {
      console.error("Error refreshing company status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [checkSetupStatus]);

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
