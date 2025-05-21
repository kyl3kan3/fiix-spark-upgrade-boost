
import { useState, useEffect, useCallback } from "react";
import { useProfileFetcher } from "./useProfileFetcher";
import { toast } from "sonner";

export interface UserRoleResult {
  role: string | null;
  isLoading: boolean;
  error: string | null;
  refreshRole: () => Promise<void>;
}

/**
 * Hook to get the current user's role with improved reliability
 */
export const useUserRole = (): UserRoleResult => {
  const { profileData, isLoading, error, refreshProfile } = useProfileFetcher(['role']);
  const [role, setRole] = useState<string | null>(null);

  // Use effect to update role when profile data changes
  useEffect(() => {
    if (profileData?.role) {
      setRole(profileData.role);
    } else if (!isLoading) {
      // Only set to null if we're not loading (to prevent flashing)
      setRole(null);
    }
  }, [profileData, isLoading]);

  // Add a refresh function
  const refreshRole = useCallback(async () => {
    try {
      const refreshedProfile = await refreshProfile();
      if (refreshedProfile?.role) {
        setRole(refreshedProfile.role);
      }
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
