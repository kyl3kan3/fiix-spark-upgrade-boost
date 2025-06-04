
import { useCallback } from "react";
import { useTeamProfileCore } from "../core/useTeamProfileCore";

export const useAdminStatusHook = () => {
  const { profile, isAdmin, isLoading, error, refreshProfile } = useTeamProfileCore(['role', 'company_name']);
  
  const refreshAdminStatus = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    isAdminUser: isAdmin,
    companyName: profile?.company_name,
    isLoading,
    error,
    refreshAdminStatus
  };
};
