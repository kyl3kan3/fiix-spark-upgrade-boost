
import React from "react";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

const AssetPageHeader: React.FC = () => {
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">Equipment</h1>
      <p className="text-base text-muted-foreground mt-1 font-medium">Everything you take care of — tools, vehicles, and machines.</p>
    </div>
  );
};

export default AssetPageHeader;
