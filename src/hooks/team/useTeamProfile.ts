
import { useCallback } from "react";
import { useTeamProfileCore } from "./core/useTeamProfileCore";

export const useTeamProfile = () => {
  const { 
    profile, 
    role, 
    companyId, 
    isAdmin, 
    isLoading, 
    error, 
    refreshProfile 
  } = useTeamProfileCore(['role', 'company_id']);
  
  console.log("useTeamProfile - Profile data:", { profile, role, companyId, isAdmin, isLoading, error });
  
  const refreshPermissions = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    profile,
    role,
    companyId,
    isAdmin,
    isLoading,
    error,
    refreshProfile,
    // Legacy exports for backward compatibility
    currentUserRole: role,
    checkingPermissions: isLoading,
    refreshPermissions
  };
};

export const useUserRolePermissions = () => {
  return useTeamProfile();
};
