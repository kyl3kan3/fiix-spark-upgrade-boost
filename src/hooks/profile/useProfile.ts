
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useProfileState } from "./useProfileState";
import { useProfileOperations } from "./useProfileOperations";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const {
    isLoading,
    isSaving,
    error,
    setLoadingState,
    setSavingState,
    setErrorState,
    clearError
  } = useProfileState();
  
  const {
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar
  } = useProfileOperations();

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoadingState(false);
      return;
    }

    try {
      setLoadingState(true);
      clearError();
      
      const data = await fetchProfile(user.id);
      setProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      setErrorState(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoadingState(false);
    }
  }, [user?.id, fetchProfile, setLoadingState, setErrorState, clearError]);

  const saveProfile = useCallback(async (updates: any) => {
    if (!user?.id) {
      throw new Error("No user ID available");
    }

    try {
      setSavingState(true);
      clearError();

      const updatedProfile = await updateProfile(user.id, updates);
      setProfile(updatedProfile);
      
      toast.success("Profile updated successfully");
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setErrorState(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSavingState(false);
    }
  }, [user?.id, updateProfile, setSavingState, setErrorState, clearError]);

  const updateAvatar = useCallback(async (file: File | null) => {
    if (!user?.id) {
      throw new Error("No user ID available");
    }

    try {
      setSavingState(true);
      clearError();

      let avatarUrl = null;

      if (file) {
        avatarUrl = await uploadAvatar(user.id, file);
      } else if (profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
      }

      const updatedProfile = await updateProfile(user.id, { avatar_url: avatarUrl });
      setProfile(updatedProfile);
      
      toast.success(file ? "Avatar updated successfully" : "Avatar removed successfully");
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update avatar";
      setErrorState(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSavingState(false);
    }
  }, [user?.id, profile?.avatar_url, uploadAvatar, deleteAvatar, updateProfile, setSavingState, setErrorState, clearError]);

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Load profile on mount and when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    updateAvatar,
    refreshProfile,
    clearError
  };
}
