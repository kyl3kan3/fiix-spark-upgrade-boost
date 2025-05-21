
import { useUserProfile } from "./useUserProfile";

export const useCurrentUserRole = () => {
  const { profileData, isLoading } = useUserProfile(['role']);
  const currentUserRole = profileData?.role || null;
  
  // Determine if the current user can edit roles (only administrators can)
  const canEditRoles = currentUserRole === 'administrator';

  return {
    currentUserRole,
    isLoading,
    canEditRoles
  };
};
