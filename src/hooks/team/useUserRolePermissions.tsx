
import { useState, useEffect } from "react";
import { useUserProfile } from "./useUserProfile";

export const useUserRolePermissions = () => {
  const { profileData, isLoading } = useUserProfile(['role']);
  const currentUserRole = profileData?.role || null;
  
  return {
    currentUserRole,
    checkingPermissions: isLoading,
    isAdmin: currentUserRole === 'administrator'
  };
};
