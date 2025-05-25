
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileActions } from "./useProfileActions";
import { useProfileState } from "./useProfileState";
import { useProfileFetch } from "./useProfileFetch";
import { ProfileData } from "@/components/profile/types";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { isLoading, isSaving, error, setLoadingState, setSavingState, setErrorState, clearError } = useProfileState();
  const { createProfile, saveProfile: saveProfileAction, updateAvatar: updateAvatarAction } = useProfileActions();
  
  const { fetchProfile } = useProfileFetch({
    setLoadingState,
    setErrorState,
    clearError,
    createProfile
  });

  const handleProfileUpdate = useCallback((updatedProfile: ProfileData) => {
    setProfile(updatedProfile);
  }, []);

  // Profile operations
  const saveProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await saveProfileAction(profile.id, updates);
      handleProfileUpdate(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, saveProfileAction, setSavingState, handleProfileUpdate]);

  const updateAvatar = useCallback(async (file: File | null) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await updateAvatarAction(profile.id, file);
      handleProfileUpdate(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, updateAvatarAction, setSavingState, handleProfileUpdate]);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setLoadingState(false);
      return;
    }

    try {
      const profileData = await fetchProfile(user.id, user.email);
      setProfile(profileData);
    } catch (error) {
      // Error handling is done in fetchProfile
    }
  }, [user?.id, user?.email, fetchProfile, setLoadingState]);

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [refreshProfile, user?.id]);

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
