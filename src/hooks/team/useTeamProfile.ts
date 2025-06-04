
import { useCallback } from "react";
import { useTeamProfileCore } from "./core/useTeamProfileCore";

export interface TeamProfileResult {
  profile: any;
  profileData: any;
  role: string | null;
  companyId: string | null;
  companyName: string | undefined;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  currentUserRole: string | null;
  checkingPermissions: boolean;
  refreshPermissions: () => Promise<void>;
}

export const useTeamProfile = () => {
  const { 
    profile, 
    role, 
    companyId, 
    isAdmin, 
    isLoading, 
    error, 
    refreshProfile 
  } = useTeamProfileCore(['role', 'company_id', 'company_name']);
  
  console.log("useTeamProfile - Profile data:", { profile, role, companyId, isAdmin, isLoading, error });
  
  const refreshPermissions = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    profile,
    profileData: profile, // Add profileData alias
    role,
    companyId,
    companyName: profile?.company_name,
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

// Export additional hooks that other files expect
export const useUserRole = () => {
  const { role, isLoading, error, refreshProfile } = useTeamProfile();
  return {
    role,
    isLoading,
    error,
    refreshRole: refreshProfile
  };
};

export const useAdminStatus = () => {
  const { isAdmin, companyName, isLoading, error, refreshProfile } = useTeamProfile();
  return {
    isAdminUser: isAdmin,
    companyName,
    isLoading,
    error,
    refreshAdminStatus: refreshProfile
  };
};

export type { TeamProfileResult };
