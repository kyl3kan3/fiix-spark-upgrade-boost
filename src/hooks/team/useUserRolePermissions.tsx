
import { useState, useEffect } from "react";
import { useProfileFetcher } from "./useProfileFetcher";

/**
 * Hook to check user role permissions with improved reliability
 */
export const useUserRolePermissions = () => {
  const { profileData, isLoading, refreshProfile } = useProfileFetcher(['role']);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  
  // Update role when profile data changes
  useEffect(() => {
    if (profileData?.role) {
      setCurrentUserRole(profileData.role);
    } else if (!isLoading) {
      // If not loading and no role, set to default role
      setCurrentUserRole('user');
    }
  }, [profileData, isLoading]);
  
  // Use a sensible default if role check times out
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !currentUserRole) {
        console.warn("Role check timed out, using default role");
        setCurrentUserRole('user');
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, currentUserRole]);
  
  return {
    currentUserRole,
    checkingPermissions: isLoading && !currentUserRole,
    isAdmin: currentUserRole === 'administrator',
    refreshPermissions: refreshProfile
  };
};
