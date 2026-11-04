import { supabase } from "@/integrations/supabase/client";

/**
 * Prefer public.user_roles; fall back to profiles.role when no row exists.
 * Matches edge functions, useTeamProfileCore, and useUserRolePermissions.
 */
export function mergeAuthoritativeUserRole(
  userRolesRole: string | null | undefined,
  profileRoleFallback: string | null | undefined,
): string | null {
  return userRolesRole ?? profileRoleFallback ?? null;
}

export async function fetchAuthoritativeUserRole(
  userId: string,
  profileRoleFallback?: string | null | undefined,
): Promise<string | null> {
  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user role:", error);
  }

  return mergeAuthoritativeUserRole(roleData?.role, profileRoleFallback);
}
