
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
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  const fetchUserProfile = useCallback(async (): Promise<any | null> => {
    try {
      setIsLoading(true);
      console.log("Fetching user profile...");
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setError("Authentication error: " + userError.message);
        setProfileData(null); // Always set profile data to null on error
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileData(null);
        setUserId(null);
        return null;
      }
      
      setUserId(user.id);
      console.log("User found, ID:", user.id);
      
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
        setProfileData(null); // Always set to null on error
        return null;
      }

      console.log("Profile data received:", data);
      if (!data) {
        console.log("No profile data found for user");
        setProfileData(null);
        return null;
      }
      
      // Type guard with proper type assertions to fix TypeScript errors
      if (typeof data === 'object' && data !== null) {
        // First convert to a generic record type that TypeScript can safely work with
        const typedData = data as Record<string, any>;
        
        // Check if company_id exists 
        if ('company_id' in typedData && typedData.company_id !== null && typedData.company_id !== undefined) {
          setProfileData({
            role: typedData.role || null,
            company_id: String(typedData.company_id),
            company_name: typedData.company_name,
            first_name: typedData.first_name,
            last_name: typedData.last_name,
            ...typedData
          });
          setError(null);
        } else {
          // Handle case where company_id is missing
          console.warn("Invalid profile data: missing company_id", data);
          setProfileData(null);
        }
      } else {
        // Handle invalid data format
        console.warn("Invalid profile data format:", data);
        setProfileData(null);
      }
      
      return data;
    } catch (err) {
      console.error("Error in useUserProfile:", err);
      setError("An unexpected error occurred");
      setProfileData(null); // Always set to null on error
      return null;
    } finally {
      setIsLoading(false);
      setFetchAttempted(true);
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
    
    // Set up a timeout to prevent waiting forever if something goes wrong
    const timeout = setTimeout(() => {
      if (isLoading && !fetchAttempted) {
        console.warn("Profile fetch timeout - forcing loading state to complete");
        setIsLoading(false);
        setError("Profile loading timed out. Please try refreshing.");
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
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
