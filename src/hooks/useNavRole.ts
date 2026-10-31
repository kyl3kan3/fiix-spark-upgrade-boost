import type { NavRole } from "@/components/shell/navConfig";
import { toNavRole } from "@/lib/navRole";
import { useUserProfile } from "@/hooks/useUserProfile";

/** Shell nav role from authoritative profile.role (user_roles with profiles fallback). */
export function useNavRole(): {
  navRole: NavRole;
  profile: ReturnType<typeof useUserProfile>["profile"];
  isLoading: boolean;
  error: ReturnType<typeof useUserProfile>["error"];
} {
  const { profile, isLoading, error } = useUserProfile();
  return {
    navRole: toNavRole(profile?.role),
    profile,
    isLoading,
    error,
  };
}
