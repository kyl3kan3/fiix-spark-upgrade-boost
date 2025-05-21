
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
 * Main hook for user profile data with simplified implementation
 */
export const useUserProfile = (fields: string[] = ['role', 'company_id']): UserProfileResult => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserProfile = useCallback(async (): Promise<any | null> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setError("Authentication error: " + userError.message);
        setProfileData(null); // Ensure we set profileData to null, not the error object
        setIsLoading(false);
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileData(null);
        setUserId(null);
        setIsLoading(false);
        return null;
      }
      
      setUserId(user.id);
      
      // Make sure required fields are included
      const fieldsToFetch = [...new Set([...fields, 'company_id'])];
      const selectFields = fieldsToFetch.join(', ');
      
      // Get profile data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(selectFields)
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching user profile:", fetchError);
        setError("Could not fetch user profile");
        setProfileData(null); // Set to null instead of the error object
        setIsLoading(false);
        return null;
      }

      // Always set profileData to the data returned or null
      setProfileData(data);
      setError(null);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("Error in useUserProfile:", err);
      setError("An unexpected error occurred");
      setProfileData(null); // Set to null instead of the error object
      setIsLoading(false);
      return null;
    }
  }, [fields]);
  
  // Function to manually refresh profile data
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    return await fetchUserProfile();
  }, [fetchUserProfile]);

  // Initial fetch
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { 
    profileData, 
    isLoading, 
    error, 
    userId,
    refreshProfile
  };
};

// For specific role access - a simplified version
export const useUserRole = () => {
  const { profileData, isLoading, error, refreshProfile } = useUserProfile(['role']);
  
  return {
    role: profileData?.role || null,
    isLoading,
    error,
    refreshRole: refreshProfile
  };
};

// For admin status check - a simplified version
export const useAdminStatus = () => {
  const { profileData, isLoading, error, refreshProfile } = useUserProfile(['role', 'company_name']);
  
  return {
    isAdminUser: profileData?.role === 'administrator',
    companyName: profileData?.company_name,
    isLoading,
    error,
    refreshAdminStatus: refreshProfile
  };
};

// For role permissions - a simplified version
export const useUserRolePermissions = () => {
  const { profileData, isLoading, refreshProfile } = useUserProfile(['role']);
  
  return {
    currentUserRole: profileData?.role || null,
    checkingPermissions: isLoading,
    isAdmin: profileData?.role === 'administrator',
    refreshPermissions: refreshProfile
  };
};
