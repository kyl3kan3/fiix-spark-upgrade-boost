
// This hook is now a simple wrapper around the unified useProfile hook
// Kept for backward compatibility
import { useProfile } from "./useProfile";

export function useSimpleProfile() {
  const { profileData, isLoading, error, refreshProfile } = useProfile();

  return {
    profileData,
    isLoading,
    error,
    refreshProfile
  };
}
