
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Directly get user from Supabase instead of using hooks
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    
    checkUser();
  }, []);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    if (!userId) {
      console.log("Cannot load profile: No user ID available");
      return null;
    }

    try {
      console.log("Loading profile for user ID:", userId);

      // Load profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", userId)
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
  }, [userId]);

  const refreshProfileStatus = useCallback(async () => {
    if (!userId) {
      console.log("Cannot refresh profile: No user ID");
      return;
    }

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
  }, [loadProfileData, userId]);

  // Initial refresh when user ID changes
  useEffect(() => {
    if (userId) {
      refreshProfileStatus();
    }
  }, [userId, refreshProfileStatus]);

  return {
    isLoading,
    companyId,
    profileError,
    loadProfileData,
    refreshProfileStatus
  };
}
