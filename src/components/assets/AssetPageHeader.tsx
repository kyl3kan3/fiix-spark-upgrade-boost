
import React from "react";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

const AssetPageHeader: React.FC = () => {
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';

  return (
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Assets</h1>
      <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your equipment and facility assets</p>
    </div>
  );
};

export default AssetPageHeader;
