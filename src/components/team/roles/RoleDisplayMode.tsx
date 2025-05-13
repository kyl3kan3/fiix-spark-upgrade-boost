
import React from "react";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { getRoleLabel } from "./roleDefinitions";

interface RoleDisplayModeProps {
  currentRole: string;
  toggleEdit: () => void;
  canEditRoles: boolean;
}

const RoleDisplayMode: React.FC<RoleDisplayModeProps> = ({
  currentRole,
  toggleEdit,
  canEditRoles
}) => {
  return (
    <>
      <span className="w-[140px] text-sm">{getRoleLabel(currentRole)}</span>
      <Button 
        size="sm" 
        variant="outline" 
        className="px-3" 
        onClick={toggleEdit}
      >
        {canEditRoles ? (
          "Edit"
        ) : (
          <>
            <LockIcon className="h-3 w-3 mr-1" />
            Locked
          </>
        )}
      </Button>
    </>
  );
};

export default RoleDisplayMode;
