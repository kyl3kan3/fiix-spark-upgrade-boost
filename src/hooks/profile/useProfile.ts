
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileActions } from "./useProfileActions";
import { useProfileState } from "./useProfileState";
import { useProfileFetch } from "./useProfileFetch";
import { useProfileOperations } from "./useProfileOperations";
import { ProfileData } from "@/components/profile/types";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { isLoading, isSaving, error, setLoadingState, setSavingState, setErrorState, clearError } = useProfileState();
  const { createProfile } = useProfileActions();
  
  const { fetchProfile } = useProfileFetch({
    setLoadingState,
    setErrorState,
    clearError,
    createProfile
  });

  const handleProfileUpdate = useCallback((updatedProfile: ProfileData) => {
    setProfile(updatedProfile);
  }, []);

  const { saveProfile, updateAvatar } = useProfileOperations({
    profile,
    setSavingState,
    onProfileUpdate: handleProfileUpdate
  });

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
