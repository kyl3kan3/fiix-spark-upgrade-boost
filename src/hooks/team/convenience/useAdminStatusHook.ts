
import { useCallback } from "react";
import { useTeamProfileCore } from "../core/useTeamProfileCore";

export const useAdminStatusHook = () => {
  const { isAdmin, companyName, isLoading, error, refreshProfile } = useTeamProfileCore(['role', 'company_name']);
  
  const refreshAdminStatus = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    isAdminUser: isAdmin,
    companyName,
    isLoading,
    error,
    refreshAdminStatus
  };
};
