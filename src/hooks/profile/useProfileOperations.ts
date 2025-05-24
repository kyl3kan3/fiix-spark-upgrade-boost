
import { useCallback } from "react";
import { ProfileData } from "@/components/profile/types";
import { useProfileActions } from "./useProfileActions";

interface UseProfileOperationsProps {
  profile: ProfileData | null;
  setSavingState: (saving: boolean) => void;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
}

export function useProfileOperations({ 
  profile, 
  setSavingState, 
  onProfileUpdate 
}: UseProfileOperationsProps) {
  const { saveProfile: saveProfileAction, updateAvatar: updateAvatarAction } = useProfileActions();

  const saveProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await saveProfileAction(profile.id, updates);
      onProfileUpdate(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, saveProfileAction, setSavingState, onProfileUpdate]);

  const updateAvatar = useCallback(async (file: File | null) => {
    if (!profile) return;

    try {
      setSavingState(true);
      const updatedProfile = await updateAvatarAction(profile.id, file);
      onProfileUpdate(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [profile, updateAvatarAction, setSavingState, onProfileUpdate]);

  return {
    saveProfile,
    updateAvatar
  };
}
