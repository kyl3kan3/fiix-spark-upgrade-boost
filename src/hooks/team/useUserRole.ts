
import { useState, useEffect } from "react";
import { useProfileFetcher } from "./useProfileFetcher";

export interface UserRoleResult {
  role: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get the current user's role
 */
export const useUserRole = (): UserRoleResult => {
  const { profileData, isLoading, error } = useProfileFetcher(['role']);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.role) {
      setRole(profileData.role);
    } else {
      setRole(null);
    }
  }, [profileData]);

  return { role, isLoading, error };
};
