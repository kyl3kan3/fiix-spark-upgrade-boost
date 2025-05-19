
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "../types";
import { toast } from "@/hooks/use-toast";

export function useProfileFetch() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Function to create an initial profile if none exists
  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      // First check if there's any company in the system to associate with
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();

      // Create initial profile with company_id if available
      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: companyData?.id || null,  // Make this optional
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone_number: null
      };

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

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setProfileError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Not authenticated, cannot load profile");
        setIsLoading(false);
        setProfileError(new Error("Not authenticated"));
        return null;
      }
      
      // Using maybeSingle() instead of single() to handle case where profile doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile data:", error);
        setProfileError(error);
        throw error;
      }
      
      console.log("Profile data fetch result:", { data, userId: user.id });
      
      if (!data) {
        console.log("No profile data found, attempting to create one");
        const createdProfile = await createInitialProfile(user.id, user.email || undefined);
        
        if (createdProfile) {
          setProfileData(createdProfile);
          return createdProfile;
        } else {
          const newError = new Error("Failed to create or fetch profile");
          setProfileError(newError);
          throw newError;
        }
      } else {
        setProfileData(data);
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
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profileData,
    setProfileData,
    isLoading,
    profileError,
    fetchProfileData
  };
}
