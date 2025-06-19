
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";

interface UseProfileFetchProps {
  setLoadingState: (loading: boolean) => void;
  setErrorState: (error: string) => void;
  clearError: () => void;
  createProfile: (userId: string, email: string | undefined) => Promise<ProfileData>;
}

export function useProfileFetch({ 
  setLoadingState, 
  setErrorState, 
  clearError, 
  createProfile 
}: UseProfileFetchProps) {
  
  const fetchProfile = useCallback(async (userId: string, userEmail: string | undefined) => {
    try {
      setLoadingState(true);
      clearError();

      console.log("Fetching profile for user ID:", userId);

      // Check if user is still authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error during profile fetch:", authError);
        throw new Error("Authentication error: " + authError.message);
      }

      if (!currentUser || currentUser.id !== userId) {
        console.error("User not authenticated or ID mismatch");
        throw new Error("User not authenticated");
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Database error fetching profile:", fetchError);
        throw new Error("Failed to fetch profile: " + fetchError.message);
      }

      if (!data) {
        console.log("No profile found, creating new profile");
        // Create profile if it doesn't exist
        const newProfile = await createProfile(userId, userEmail);
        return newProfile;
      } else {
        console.log("Profile found:", data);
        return data;
      }
    } catch (error: any) {
      console.error("Error in fetchProfile:", error);
      setErrorState(error.message || "Failed to load profile");
      throw error;
    } finally {
      setLoadingState(false);
    }
  }, [setLoadingState, setErrorState, clearError, createProfile]);

  return {
    fetchProfile
  };
}
