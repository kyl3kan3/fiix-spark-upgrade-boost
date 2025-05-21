
import { useState } from "react";
import { showCompanySetupCompletedNotification, navigateToDashboard } from "./utils/companyStatusNotifications";

/**
 * Hook to handle company found events
 */
export function useCompanyFoundHandler(
  setSetupComplete: (isComplete: boolean) => void,
) {
  const [companyFoundId, setCompanyFoundId] = useState<string | null>(null);

  /**
   * Handle when a company is found for the user
   */
  const handleCompanyFound = (newCompanyId: string) => {
    setSetupComplete(true);
    setCompanyFoundId(newCompanyId);
    console.log("Company found and setup marked complete:", newCompanyId);
    
    showCompanySetupCompletedNotification();
    navigateToDashboard();
  };

  return {
    companyFoundId,
    handleCompanyFound
  };
}
