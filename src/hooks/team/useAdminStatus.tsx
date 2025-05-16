
import { useUserProfile } from "./useUserProfile";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
}

export const useAdminStatus = (): AdminStatusResult => {
  const { profileData, isLoading, error } = useUserProfile(['role', 'company_name']);
  
  const isAdminUser = profileData?.role === 'administrator';
  const companyName = profileData?.company_name;
  
  return {
    isAdminUser,
    companyName,
    isLoading,
    error
  };
};
