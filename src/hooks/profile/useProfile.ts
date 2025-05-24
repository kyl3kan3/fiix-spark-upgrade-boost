
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileActions } from "./useProfileActions";
import { useProfileState } from "./useProfileState";
import { ProfileData } from "@/components/profile/types";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { isLoading, isSaving, error, setLoadingState, setSavingState, setErrorState, clearError } = useProfileState();
  const { saveProfile: saveProfileAction, updateAvatar: updateAvatarAction, createProfile } = useProfileActions();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoadingState(false);
      return;
    }

    try {
      setLoadingState(true);
      clearError();

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Create profile if it doesn't exist
        const newProfile = await createProfile(user.id, user.email);
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setErrorState(error.message);
    } finally {
      setLoadingState(false);
    }
  }, [user, setLoadingState, setErrorState, clearError, createProfile]);

  const saveProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await saveProfileAction(profile.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, saveProfileAction, setSavingState]);

  const updateAvatar = useCallback(async (file: File | null) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await updateAvatarAction(profile.id, file);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, updateAvatarAction, setSavingState]);

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [fetchProfile, user?.id]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    updateAvatar,
    refreshProfile
  };
}
