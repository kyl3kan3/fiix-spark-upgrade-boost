
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfileFetcherResult {
  profileData: any | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<any | null>;
}

/**
 * Hook to fetch user profile data from Supabase
 * with improved reliability and timeout management
 */
export const useProfileFetcher = (fields: string[] = ['role', 'company_id']): ProfileFetcherResult => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Fetch profile function with retry logic
  const fetchUserProfile = useCallback(async (): Promise<any | null> => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setError("Authentication error: " + userError.message);
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileData(null);
        setUserId(null);
        return null;
      }
      
      setUserId(user.id);
      
      // Make sure company_id is always included in the fields
      const fieldsToFetch = fields.includes('company_id') 
        ? fields 
        : [...fields, 'company_id'];
      
      // Build the select query with requested fields
      const selectFields = fieldsToFetch.join(', ');
      
      // Get profile data from profiles - use maybeSingle() to handle case where profile doesn't exist
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
      
      // Process and validate the profile data
      if (!data) {
        console.warn("No profile data found, user may need to complete onboarding");
        setProfileData(null);
        setError("User profile data is incomplete. Setup process required.");
        return null;
      }
      
      // TypeScript safe check - ensure data exists and is an object
      if (typeof data === 'object') {
        // Then check for company_id property
        const profile = data as Record<string, any>;
        if ('company_id' in profile && profile.company_id !== null) {
          setProfileData(profile);
          setError(null);
          return profile;
        } else {
          console.warn("Invalid profile data: missing company_id", data);
          setProfileData(null);
          setError("User needs to complete setup");
          return null;
        }
      } else {
        setProfileData(null);
        setError("Invalid profile data format");
        return null;
      }
    } catch (err) {
      console.error("Error in useProfileFetcher:", err);
      setError("An unexpected error occurred");
      setProfileData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fields]);

  // Function to refresh profile data on demand
  const refreshProfile = useCallback(async () => {
    setFetchAttempts(prev => prev + 1);
    return await fetchUserProfile();
  }, [fetchUserProfile]);

  // Set up timeout to prevent getting stuck in loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && fetchAttempts > 0) {
        setIsLoading(false);
        setError("Profile loading timed out. Please refresh.");
        toast.error("Failed to load profile data. Please refresh the page.");
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, fetchAttempts]);
  
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
