
import { useState, useEffect } from "react";
import { useProfileFetcher } from "./useProfileFetcher";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
  refreshAdminStatus: () => Promise<any | null>;
}

export const useAdminStatus = (): AdminStatusResult => {
  const { profileData, isLoading, error, refreshProfile } = useProfileFetcher(['role', 'company_name']);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Update admin status when profile data changes
  useEffect(() => {
    if (profileData) {
      setIsAdminUser(profileData.role === 'administrator');
    } else if (!isLoading) {
      setIsAdminUser(false);
    }
  }, [profileData, isLoading]);
  
  return {
    isAdminUser,
    companyName: profileData?.company_name,
    isLoading,
    error,
    refreshAdminStatus: refreshProfile
  };
};
