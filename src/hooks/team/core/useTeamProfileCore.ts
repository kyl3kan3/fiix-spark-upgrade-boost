
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamProfileData, TeamProfileResult } from "../types";

/**
 * Core hook for team profile data fetching and management
 */
export const useTeamProfileCore = (fields: string[] = ['role', 'company_id', 'company_name']): TeamProfileResult => {
  const [profileData, setProfileData] = useState<TeamProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserProfile = useCallback(async (): Promise<any | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Starting profile fetch...");
      
      // Get current user with better error handling
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        // Handle specific auth errors more gracefully
        if (userError.message.includes("Auth session missing")) {
          console.log("No active session found - user needs to log in");
          setError("Please log in to access this feature");
          setProfileData(null);
          setUserId(null);
          setIsLoading(false);
          return null;
        }
        
        console.error("Auth error when getting user:", userError);
        setError("Authentication error: " + userError.message);
        setProfileData(null);
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
      
      console.log("User authenticated:", user.id);
      setUserId(user.id);
      
      // Make sure required fields are included
      const fieldsToFetch = [...new Set([...fields, 'company_id'])];
      const selectFields = fieldsToFetch.join(', ');
      
      console.log("Fetching profile with fields:", selectFields);
      
      // Get profile data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(selectFields)
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching user profile:", fetchError);
        setError("Could not fetch user profile: " + fetchError.message);
        setProfileData(null);
        setIsLoading(false);
        return null;
      }

      if (!data) {
        console.log("No profile data found for user");
        setError("No profile found for user");
        setProfileData(null);
        setIsLoading(false);
        return null;
      }

      // Fetch role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
      }

      // Use role from user_roles if available, fallback to profiles.role
      const userRole = roleData?.role || (data as any).role || null;
      
      console.log("Profile data fetched successfully:", data, "Role:", userRole);
      
      // Process and validate the profile data
      if (typeof data === 'object' && data !== null) {
        const typedData = data as Record<string, any>;
        
        if ('company_id' in typedData && typedData.company_id !== null && typedData.company_id !== undefined) {
          const profileData: TeamProfileData = {
            role: userRole,
            company_id: String(typedData.company_id),
            company_name: typedData.company_name,
            first_name: typedData.first_name,
            last_name: typedData.last_name,
            ...typedData
          };
          setProfileData(profileData);
          setError(null);
          console.log("Profile processed successfully");
        } else {
          console.warn("Invalid profile data: missing company_id", data);
          setError("Profile missing required company information");
          setProfileData(null);
        }
      } else {
        console.warn("Invalid profile data format:", data);
        setError("Invalid profile data format");
        setProfileData(null);
      }
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("Error in useTeamProfile:", err);
      setError("An unexpected error occurred: " + (err as Error).message);
      setProfileData(null);
      setIsLoading(false);
      return null;
    }
  }, []); // Remove fields dependency to prevent infinite loops
  
  const refreshProfile = useCallback(async () => {
    return await fetchUserProfile();
  }, [fetchUserProfile]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    let mounted = true;
    
    const doFetch = async () => {
      if (mounted) {
        await fetchUserProfile();
      }
    };
    
    doFetch();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

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
