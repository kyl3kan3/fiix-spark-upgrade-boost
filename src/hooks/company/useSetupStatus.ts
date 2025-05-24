
import { useState, useEffect, useCallback } from "react";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";

export function useSetupStatus() {
  const [setupComplete, setSetupCompleteState] = useState<boolean | null>(null);

  // Check setup status from localStorage
  const checkSetupStatus = useCallback(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEYS.SETUP_COMPLETE);
    return stored === 'true';
  }, []);

  // Update setup status
  const setSetupComplete = useCallback((complete: boolean) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.SETUP_COMPLETE, complete ? 'true' : 'false');
    setSetupCompleteState(complete);
  }, []);

  // Initialize setup status
  useEffect(() => {
    const isComplete = checkSetupStatus();
    setSetupCompleteState(isComplete);
  }, [checkSetupStatus]);

  return {
    setupComplete,
    setSetupComplete,
    checkSetupStatus
  };
}
