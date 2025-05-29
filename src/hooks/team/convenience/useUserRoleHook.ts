
import { useCallback } from "react";
import { toast } from "sonner";
import { useTeamProfileCore } from "../core/useTeamProfileCore";

export const useUserRoleHook = () => {
  const { role, isLoading, error, refreshProfile } = useTeamProfileCore(['role']);
  
  const refreshRole = useCallback(async () => {
    try {
      await refreshProfile();
    } catch (err) {
      toast.error("Failed to refresh role information");
      console.error("Error refreshing role:", err);
    }
  }, [refreshProfile]);
  
  return {
    role,
    isLoading,
    error,
    refreshRole
  };
};
