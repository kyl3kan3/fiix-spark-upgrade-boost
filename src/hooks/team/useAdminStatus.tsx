
import { useProfileFetcher } from "./useProfileFetcher";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
}

export const useAdminStatus = (): AdminStatusResult => {
  const { profileData, isLoading, error } = useProfileFetcher(['role', 'company_name']);
  
  const isAdminUser = profileData?.role === 'administrator';
  const companyName = profileData?.company_name;
  
  return {
    isAdminUser,
    companyName,
    isLoading,
    error
  };
};
