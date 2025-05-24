
import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Role, RolePermission } from "./types";
import PermissionsCategory from "./PermissionsCategory";

interface PermissionsPanelProps {
  selectedRole: Role | null;
  permissions: RolePermission[];
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onTogglePermission: (permissionId: string) => void;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({
  selectedRole,
  permissions,
  isEditing,
  setIsEditing,
  onTogglePermission,
}) => {
  const permissionCategories = [...new Set(permissions.map(p => p.categories[0]))];

  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center h-full border rounded-md p-8 text-center text-muted-foreground">
        <Users className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">Select a Role</h3>
        <p className="mt-2">
          Choose a role from the left panel to view or edit its permissions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{selectedRole.name} Permissions</h3>
        {selectedRole.isEditable && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done" : "Edit Permissions"}
          </Button>
        )}
      </div>
      
      {!selectedRole.isEditable && !isEditing && (
        <p className="text-sm text-amber-600">
          This is a system role and cannot be modified.
        </p>
      )}
      
      <div className="space-y-6">
        {permissionCategories.map((category) => {
          const categoryPermissions = permissions.filter(p => p.categories[0] === category);
          
          return (
            <PermissionsCategory
              key={category}
              category={category}
              permissions={categoryPermissions}
              selectedPermissions={selectedRole.permissions}
              isEditable={selectedRole.isEditable || false}
              isEditing={isEditing}
              onTogglePermission={onTogglePermission}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsPanel;
