
import { useProfileFetcher } from "./useProfileFetcher";

interface UserProfileData {
  role: string | null;
  company_name?: string;
  company_id: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface UserProfileResult {
  profileData: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  refreshProfile: () => Promise<any | null>;
}

/**
 * Main hook for user profile data
 * This maintains backward compatibility with existing code
 * with improved reliability
 */
export const useUserProfile = (fields: string[] = ['role', 'company_id']): UserProfileResult => {
  const result = useProfileFetcher(fields);
  
  // Cast the profileData to UserProfileData to maintain backward compatibility
  return {
    ...result,
    profileData: result.profileData as UserProfileData | null
  };
};
