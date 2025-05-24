
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/profile/useProfile";
import { useUnifiedCompanyStatus } from "@/hooks/company/useUnifiedCompanyStatus";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
  refreshAdminStatus: () => Promise<void>;
}

export const useAdminStatus = (): AdminStatusResult => {
  const { profile, isLoading: profileLoading, error, refreshProfile } = useProfile();
  const { isLoading: companyLoading, refreshStatus } = useUnifiedCompanyStatus();
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Update admin status when profile data changes
  useEffect(() => {
    if (profile) {
      setIsAdminUser(profile.role === 'administrator');
    } else if (!profileLoading) {
      setIsAdminUser(false);
    }
  }, [profile, profileLoading]);
  
  const refreshAdminStatus = async () => {
    await Promise.all([refreshProfile(), refreshStatus()]);
  };
  
  return {
    isAdminUser,
    companyName: profile?.company_name,
    isLoading: profileLoading || companyLoading,
    error,
    refreshAdminStatus
  };
};
