
import { useState, useEffect, useCallback } from "react";

export function useSetupStatus() {
  const [setupComplete, setSetupCompleteState] = useState<boolean | null>(null);

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

  return {
    setupComplete,
    setSetupComplete,
    checkSetupStatus
  };
}
