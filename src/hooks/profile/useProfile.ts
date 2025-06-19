
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileActions } from "./useProfileActions";
import { useProfileState } from "./useProfileState";
import { useProfileFetch } from "./useProfileFetch";
import { ProfileData } from "@/components/profile/types";

export function useProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // Only fetch if user is authenticated and available
    if (!isAuthenticated || !user?.id) {
      console.log("useProfile: User not authenticated, clearing profile");
      setLoadingState(false);
      setProfile(null);
      clearError();
      return;
    }

    try {
      console.log("Fetching profile for user:", user.id);
      const profileData = await fetchProfile(user.id, user.email);
      setProfile(profileData);
      clearError();
    } catch (error) {
      console.error("Error refreshing profile:", error);
      // Error handling is done in fetchProfile
    }
  }, [user?.id, user?.email, isAuthenticated, authLoading, fetchProfile, setLoadingState, clearError]);

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) {
      console.log("useProfile: Auth still loading, waiting...");
      return;
    }

    if (isAuthenticated && user?.id) {
      console.log("useProfile: User authenticated, fetching profile");
      refreshProfile();
    } else {
      console.log("useProfile: User not authenticated or no user ID");
      setLoadingState(false);
      setProfile(null);
      clearError();
    }
  }, [refreshProfile, isAuthenticated, user?.id, authLoading]);

  return {
    profile,
    isLoading: authLoading || isLoading,
    isSaving,
    error,
    saveProfile,
    updateAvatar,
    refreshProfile
  };
}
