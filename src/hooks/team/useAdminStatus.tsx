
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/profile/useProfile";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
  refreshAdminStatus: () => Promise<void>;
}

export const useAdminStatus = (): AdminStatusResult => {
  const { profileData, isLoading, error, refreshProfile } = useProfile();
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
