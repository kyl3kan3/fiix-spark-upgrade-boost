
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setProfileError(new Error("Authentication error: " + userError.message));
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileError(new Error("No authenticated user found. Please sign in."));
        return null;
      }

      console.log("Loading profile for user ID:", user.id);

      // Load profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading profile:", error);
        setProfileError(new Error(error.message));
        return null;
      }
      
      console.log("Profile loaded:", profile);
      
      return profile;
    } catch (error) {
      console.error("Error in loading profile data:", error);
      if (error instanceof Error) {
        setProfileError(error);
      } else {
        setProfileError(new Error('Unknown error loading profile data'));
      }
      return null;
    }
  }, []);

  const refreshProfileStatus = useCallback(async () => {
    setIsLoading(true);
    setProfileError(null);
    
    try {
      // Load profile data
      const profile = await loadProfileData();
      
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        console.log("Company ID found in profile:", profile.company_id);
      } else {
        setCompanyId(null);
        console.log("No company ID found in profile");
      }
    } catch (error) {
      console.error("Error refreshing profile status:", error);
      if (error instanceof Error) {
        setProfileError(error);
      } else {
        setProfileError(new Error('Unknown error refreshing profile status'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadProfileData]);

  return {
    isLoading,
    companyId,
    profileError,
    loadProfileData,
    refreshProfileStatus
  };
}
