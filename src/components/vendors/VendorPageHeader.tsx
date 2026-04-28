
import React from "react";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

const VendorPageHeader: React.FC = () => {
  const { currentUserRole } = useUserRolePermissions();
  
  // Default to allowing add actions if role is not loaded yet
  const canAdd = !currentUserRole || currentUserRole === 'administrator' || currentUserRole === 'manager';

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">Suppliers</h1>
      <p className="mt-2 text-base text-muted-foreground font-medium">People who help you — service providers, parts shops, and contractors.</p>
    </div>
  );
};

export default VendorPageHeader;
