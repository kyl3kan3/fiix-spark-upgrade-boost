
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

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Create profile if it doesn't exist
        const newProfile = await createProfile(userId, userEmail);
        return newProfile;
      } else {
        return data;
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setErrorState(error.message);
      throw error;
    } finally {
      setLoadingState(false);
    }
  }, [setLoadingState, setErrorState, clearError, createProfile]);

  return {
    fetchProfile
  };
}
