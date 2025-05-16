
import { useUserProfile } from "./useUserProfile";

export const useCurrentUserRole = () => {
  const { profileData, isLoading } = useUserProfile(['role']);
  const currentUserRole = profileData?.role || null;
  
  // Determine if the current user can edit roles (only administrators can)
  const canEditRoles = currentUserRole === 'administrator';
  
  console.log("Current user role:", currentUserRole, "Can edit roles:", canEditRoles);

  return {
    currentUserRole,
    isLoading,
    canEditRoles
  };
};
