
import { useTeamProfileCore } from "./core/useTeamProfileCore";
import { useUserRoleHook } from "./convenience/useUserRoleHook";
import { useAdminStatusHook } from "./convenience/useAdminStatusHook";
import { useUserRolePermissionsHook } from "./convenience/useUserRolePermissionsHook";

// Export types
export type { TeamProfileData, TeamProfileResult } from "./types";

// Main hook - alias to the core hook for backward compatibility
export const useTeamProfile = useTeamProfileCore;

// Convenience hooks for specific use cases
export const useUserRole = useUserRoleHook;
export const useAdminStatus = useAdminStatusHook;
export const useUserRolePermissions = useUserRolePermissionsHook;
