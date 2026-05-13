
// Re-export from the new consolidated hook for backward compatibility with debug logging
import { useUserRolePermissionsHook } from './convenience/useUserRolePermissionsHook';
import { logger } from "@/lib/logger";

export const useUserRolePermissions = () => {
  const result = useUserRolePermissionsHook();
  
  // Debug logging
  logger.log('🔍 useUserRolePermissions - Current user role:', result.currentUserRole);
  logger.log('🔍 useUserRolePermissions - Is admin:', result.isAdmin);
  logger.log('🔍 useUserRolePermissions - Checking permissions:', result.checkingPermissions);
  
  return result;
};
