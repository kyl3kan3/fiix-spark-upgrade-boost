
import { useCallback, useState } from "react";
import { useSetupStatus } from "./useSetupStatus";

export function useCompanyStatusRefresh() {
  const [error, setError] = useState<string | null>(null);
  const { checkSetupStatus, setSetupComplete } = useSetupStatus();

  // Refresh all status
  const refreshStatus = useCallback(async () => {
    try {
      setError(null);
      const isComplete = checkSetupStatus();
      setSetupComplete(isComplete);
      
      // Profile data will be refreshed by useProfile hook
    } catch (err) {
      console.error("Error refreshing company status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [checkSetupStatus, setSetupComplete]);

  return {
    error,
    setError,
    refreshStatus
  };
}
