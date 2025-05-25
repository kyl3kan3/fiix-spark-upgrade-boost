
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamProfileData {
  role: string | null;
  company_name?: string;
  company_id: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export interface TeamProfileResult {
  profileData: TeamProfileData | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  companyName: string | undefined;
  refreshProfile: () => Promise<any | null>;
}

/**
 * Unified hook for team profile data with all functionality consolidated
 */
export const useTeamProfile = (fields: string[] = ['role', 'company_id', 'company_name']): TeamProfileResult => {
  const [profileData, setProfileData] = useState<TeamProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserProfile = useCallback(async (): Promise<any | null> => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setError("Authentication error: " + userError.message);
        setProfileData(null);
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileData(null);
        setUserId(null);
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
        setProfileData(null);
        return null;
      }

      if (!data) {
        console.log("No profile data found for user");
        setProfileData(null);
        return null;
      }
      
      // Process and validate the profile data
      if (typeof data === 'object' && data !== null) {
        const typedData = data as Record<string, any>;
        
        if ('company_id' in typedData && typedData.company_id !== null && typedData.company_id !== undefined) {
          const profileData: TeamProfileData = {
            role: typedData.role || null,
            company_id: String(typedData.company_id),
            company_name: typedData.company_name,
            first_name: typedData.first_name,
            last_name: typedData.last_name,
            ...typedData
          };
          setProfileData(profileData);
          setError(null);
        } else {
          console.warn("Invalid profile data: missing company_id", data);
          setProfileData(null);
        }
      } else {
        console.warn("Invalid profile data format:", data);
        setProfileData(null);
      }
      
      return data;
    } catch (err) {
      console.error("Error in useTeamProfile:", err);
      setError("An unexpected error occurred");
      setProfileData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fields]);
  
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    return await fetchUserProfile();
  }, [fetchUserProfile]);

  // Initial fetch
  useEffect(() => {
    fetchUserProfile();
    
    // Set up a timeout to prevent waiting forever
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Profile fetch timeout - forcing loading state to complete");
        setIsLoading(false);
        setError("Profile loading timed out. Please try refreshing.");
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [fetchUserProfile]);

  // Computed values
  const role = profileData?.role || null;
  const isAdmin = role === 'administrator';
  const companyName = profileData?.company_name;

  return { 
    profileData, 
    isLoading, 
    error, 
    userId,
    role,
    isAdmin,
    companyName,
    refreshProfile
  };
};

// Convenience hooks for specific use cases
export const useUserRole = () => {
  const { role, isLoading, error, refreshProfile } = useTeamProfile(['role']);
  
  const refreshRole = useCallback(async () => {
    try {
      await refreshProfile();
    } catch (err) {
      toast.error("Failed to refresh role information");
      console.error("Error refreshing role:", err);
    }
  }, [refreshProfile]);
  
  return {
    role,
    isLoading,
    error,
    refreshRole
  };
};

export const useAdminStatus = () => {
  const { isAdmin, companyName, isLoading, error, refreshProfile } = useTeamProfile(['role', 'company_name']);
  
  const refreshAdminStatus = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    isAdminUser: isAdmin,
    companyName,
    isLoading,
    error,
    refreshAdminStatus
  };
};

export const useUserRolePermissions = () => {
  const { role, isAdmin, isLoading, refreshProfile } = useTeamProfile(['role']);
  
  const refreshPermissions = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);
  
  return {
    currentUserRole: role,
    checkingPermissions: isLoading,
    isAdmin,
    refreshPermissions
  };
};
