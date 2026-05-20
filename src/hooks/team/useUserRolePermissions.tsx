
// Re-export from the new consolidated hook for backward compatibility with debug logging
import { useUserRolePermissionsHook } from './convenience/useUserRolePermissionsHook';

export const useUserRolePermissions = () => {
 const result = useUserRolePermissionsHook();
 
 // Debug logging
 console.log('🔍 useUserRolePermissions - Current user role:', result.currentUserRole);
 console.log('🔍 useUserRolePermissions - Is admin:', result.isAdmin);
 console.log('🔍 useUserRolePermissions - Checking permissions:', result.checkingPermissions);
 
 return result;
};
