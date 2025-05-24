
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileActions } from "./useProfileActions";
import { useProfileState } from "./useProfileState";
import { useProfileFetch } from "./useProfileFetch";
import { ProfileData } from "@/components/profile/types";

export function useProfileData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { isLoading, error, setLoadingState, setErrorState, clearError } = useProfileState();
  const { createProfile } = useProfileActions();
  
  const { fetchProfile } = useProfileFetch({
    setLoadingState,
    setErrorState,
    clearError,
    createProfile
  });

  const loadProfile = useCallback(async () => {
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
      loadProfile();
    }
  }, [loadProfile, user?.id]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: loadProfile
  };
}
