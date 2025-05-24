
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";
import { toast } from "sonner";

export function useProfileFetch() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      return data;
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.message);
      toast.error("Error loading profile", {
        description: "Please try refreshing the page"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfileData = (updates: Partial<ProfileData>) => {
    if (profileData) {
      setProfileData({ ...profileData, ...updates });
    }
  };

  return {
    profileData,
    setProfileData,
    updateProfileData,
    isLoading,
    setIsLoading,
    error,
    setError,
    fetchProfile
  };
}
