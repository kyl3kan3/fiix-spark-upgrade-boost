
import { useState, useEffect } from "react";
import { useProfileFetcher } from "./useProfileFetcher";

/**
 * Hook to check user role permissions
 */
export const useUserRolePermissions = () => {
  const { profileData, isLoading } = useProfileFetcher(['role']);
  const currentUserRole = profileData?.role || null;
  
  return {
    currentUserRole,
    checkingPermissions: isLoading,
    isAdmin: currentUserRole === 'administrator'
  };
};
