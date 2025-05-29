
import { useCallback } from "react";
import { useTeamProfileCore } from "../core/useTeamProfileCore";

export const useUserRolePermissionsHook = () => {
  const { role, isAdmin, isLoading, refreshProfile } = useTeamProfileCore(['role']);
  
  const refreshPermissions = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    currentUserRole: role,
    checkingPermissions: isLoading,
    isAdmin,
    refreshPermissions
  };
};
