
// This hook is now a simple wrapper around the unified useProfile hook
// Kept for backward compatibility
import { useProfile } from "./useProfile";

export function useSimpleProfile() {
  const { profile, isLoading, error, refreshProfile } = useProfile();

  return {
    profileData: profile, // Map profile back to profileData for backwards compatibility
    isLoading,
    error,
    refreshProfile
  };
}
