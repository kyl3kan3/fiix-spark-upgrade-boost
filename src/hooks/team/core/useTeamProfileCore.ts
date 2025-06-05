
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface ProfileData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  company_id: string;
  company_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

export const useTeamProfileCore = (fields: string[] = ['*']) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      console.log("Fetching user session...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("User session error:", userError);
        throw userError;
      }

      if (!user) {
        console.log("No authenticated user found");
        setProfile(null);
        setUser(null);
        return;
      }

      console.log("User authenticated:", user.id);
      setUser(user);

      console.log("Fetching profile with fields:", fields);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(fields.join(', '))
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      console.log("Profile data fetched:", profileData);
      setProfile(profileData);
      setError(null);
    } catch (err: any) {
      console.error("Error in fetchProfile:", err);
      setError(err.message || 'An error occurred');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [fields]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    role: profile?.role || null,
    companyId: profile?.company_id || null,
    companyName: profile?.company_name,
    isAdmin: profile?.role === 'administrator',
    user,
    isLoading,
    error,
    refreshProfile
  };
};
