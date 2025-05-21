
import { useState, useCallback } from "react";

export function useCompanySetupStatus() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  // Check if user has completed setup
  const checkSetupCompleted = useCallback(() => {
    const setupCompleted = localStorage.getItem('maintenease_setup_complete');
    const result = setupCompleted === 'true';
    return result;
  }, []);

  // Refresh setup status
  const refreshSetupStatus = useCallback(() => {
    const isSetupComplete = checkSetupCompleted();
    setSetupComplete(isSetupComplete);
  }, [checkSetupCompleted]);

  // Update setup status in localStorage and state
  const updateSetupComplete = useCallback((isComplete: boolean) => {
    localStorage.setItem('maintenease_setup_complete', isComplete ? 'true' : 'false');
    setSetupComplete(isComplete);
  }, []);

  return {
    setupComplete,
    checkSetupCompleted,
    refreshSetupStatus,
    setSetupComplete: updateSetupComplete
  };
}
