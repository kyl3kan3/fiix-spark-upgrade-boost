
import { useProfileData } from "./useProfileData";
import { toast } from "sonner";

export function useProfile() {
  const { profileData, isLoading, error, updateProfile, refreshProfile } = useProfileData();

  const updateAvatar = async (avatar: string | null) => {
    const success = await updateProfile({ avatar_url: avatar });
    if (success) {
      toast.success("Avatar updated!");
    }
    return success;
  };

  return {
    profileData,
    isLoading,
    error,
    updateProfile,
    updateAvatar,
    refreshProfile
  };
}
