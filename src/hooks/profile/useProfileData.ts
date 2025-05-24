
import { useEffect, useCallback } from "react";
import { ProfileData } from "@/components/profile/types";
import { useAuth } from "@/hooks/auth";
import { useProfileFetch } from "./useProfileFetch";
import { useProfileCreation } from "./useProfileCreation";
import { useProfileUpdate } from "./useProfileUpdate";

export function useProfileData() {
  const { user } = useAuth();
  const {
    profileData,
    setProfileData,
    updateProfileData,
    isLoading,
    setIsLoading,
    error,
    fetchProfile
  } = useProfileFetch();
  const { createInitialProfile } = useProfileCreation();
  const { updateProfile: updateProfileInDb } = useProfileUpdate();

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    const data = await fetchProfile(user.id);
    
    if (!data) {
      const createdProfile = await createInitialProfile(user.id, user.email);
      if (createdProfile) {
        setProfileData(createdProfile);
      }
    } else {
      setProfileData(data);
    }
  }, [user, fetchProfile, createInitialProfile, setProfileData, setIsLoading]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!profileData) return false;
    
    const success = await updateProfileInDb(profileData.id, updates);
    
    if (success) {
      updateProfileData(updates);
    }
    
    return success;
  };

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [refreshProfile, user]);

  return {
    profileData,
    isLoading,
    error,
    updateProfile,
    refreshProfile
  };
}
