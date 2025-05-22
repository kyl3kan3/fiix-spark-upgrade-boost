
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "../types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useProfileFetch() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

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
      
      // When inserting data with RLS policies, we need to use the service role key or ensure the user has proper permissions
      // Here we're inserting the user's own profile, which should be allowed with proper RLS policies
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
    if (!user?.id) {
      console.log("No user ID available, cannot fetch profile");
      setIsLoading(false);
      return null;
    }
    
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
        toast.error("Loading timed out", {
          description: "Could not load your profile. Please refresh and try again."
        });
      }, 10000); // 10 second timeout
      
      setLoadingTimeout(timeout);
      
      console.log("Fetching profile data for user ID:", user.id);
      
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
      toast.error("Error loading profile", {
        description: "Please try refreshing the page"
      });
      return null;
    } finally {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    }
  }, [loadingTimeout, user]);

  // Initial fetch on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
    
    return () => {
      // Clean up timeout on unmount
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [fetchProfileData, user]);

  return {
    profileData,
    setProfileData,
    isLoading,
    profileError,
    fetchProfileData
  };
}
