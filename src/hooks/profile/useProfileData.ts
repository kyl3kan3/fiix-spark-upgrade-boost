
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";

export function useProfileData() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      console.log("Creating initial profile for user:", userId);
      
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();

      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: companyData?.id || null,
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone_number: null,
        company_name: null
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Failed to create initial profile:", error);
      return null;
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      if (!data) {
        const createdProfile = await createInitialProfile(user.id, user.email);
        if (createdProfile) {
          setProfileData(createdProfile);
        } else {
          throw new Error("Failed to create or fetch profile");
        }
      } else {
        setProfileData(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.message);
      toast.error("Error loading profile", {
        description: "Please try refreshing the page"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!profileData) return false;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileData.id);
        
      if (error) throw error;
      
      setProfileData({ ...profileData, ...updates });
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Update failed", {
        description: error.message,
      });
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [fetchProfile, user]);

  return {
    profileData,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile
  };
}
