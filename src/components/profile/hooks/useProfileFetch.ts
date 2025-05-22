
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "../types";
import { toast } from "@/hooks/use-toast";

export function useProfileFetch() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to create an initial profile if none exists
  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      console.log("Creating initial profile for user:", userId);
      
      // First check if there's any company in the system to associate with
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (companyError) {
        console.error("Error fetching companies:", companyError);
      }

      // Create initial profile with company_id if available
      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: companyData?.id || null,
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone_number: null
      };

      console.log("Attempting to create profile with:", newProfile);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      console.log("Created new profile:", data);
      return data;
    } catch (error: any) {
      console.error("Failed to create initial profile:", error);
      return null;
    }
  };

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setProfileError(null);
      
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // Set a new timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setProfileError(new Error("Profile loading timed out. Please try again."));
        toast({
          title: "Loading timed out",
          description: "Could not load your profile. Please refresh and try again.",
          variant: "destructive",
        });
      }, 10000); // 10 second timeout
      
      setLoadingTimeout(timeout);
      
      console.log("Fetching profile data...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Auth error in useProfileFetch:", userError);
        setProfileError(new Error("Authentication error: " + userError.message));
        setIsLoading(false);
        clearTimeout(timeout);
        return null;
      }
      
      if (!user) {
        console.log("Not authenticated, cannot load profile");
        setIsLoading(false);
        setProfileError(new Error("Not authenticated"));
        clearTimeout(timeout);
        return null;
      }
      
      console.log("Authenticated as:", user.id);
      
      // Using maybeSingle() instead of single() to handle case where profile doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile data:", error);
        setProfileError(error);
        clearTimeout(timeout);
        throw error;
      }
      
      console.log("Profile data fetch result:", { data, userId: user.id });
      
      if (!data) {
        console.log("No profile data found, attempting to create one");
        const createdProfile = await createInitialProfile(user.id, user.email || undefined);
        
        if (createdProfile) {
          setProfileData(createdProfile);
          clearTimeout(timeout);
          return createdProfile;
        } else {
          const newError = new Error("Failed to create or fetch profile");
          setProfileError(newError);
          clearTimeout(timeout);
          throw newError;
        }
      } else {
        setProfileData(data);
        clearTimeout(timeout);
        return data;
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      setProfileError(error);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    }
  }, [loadingTimeout]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProfileData();
    
    return () => {
      // Clean up timeout on unmount
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [fetchProfileData]);

  return {
    profileData,
    setProfileData,
    isLoading,
    profileError,
    fetchProfileData
  };
}
