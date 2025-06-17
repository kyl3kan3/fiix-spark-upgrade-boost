
import React from "react";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

const VendorPageHeader: React.FC = () => {
  const { currentUserRole } = useUserRolePermissions();
  
  // Default to allowing add actions if role is not loaded yet
  const canAdd = !currentUserRole || currentUserRole === 'administrator' || currentUserRole === 'manager';

  return (
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Vendors</h1>
      <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your service providers and suppliers</p>
    </div>
  );
};

export default VendorPageHeader;
