
import React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RolePermission } from "./types";

interface PermissionsCategoryProps {
  category: string;
  permissions: RolePermission[];
  selectedPermissions: string[];
  isEditable: boolean;
  isEditing: boolean;
  onTogglePermission: (permissionId: string) => void;
}

const PermissionsCategory: React.FC<PermissionsCategoryProps> = ({
  category,
  permissions,
  selectedPermissions,
  isEditable,
  isEditing,
  onTogglePermission,
}) => {
  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Work Orders": return "Permissions for managing maintenance tasks";
      case "Assets": return "Permissions for managing equipment and assets";
      case "Users": return "Permissions for managing user accounts";
      case "Reports": return "Permissions for viewing and creating reports";
      case "Administration": return "System-wide configuration permissions";
      default: return "";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-medium mb-2">{category}</h4>
        <CardDescription className="mb-4">
          {getCategoryDescription(category)}
        </CardDescription>
        
        <div className="space-y-3">
          {permissions.map((permission) => (
            <div 
              key={permission.id} 
              className="flex items-start space-x-2"
            >
              <Checkbox 
                id={`permission-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={() => {
                  if (isEditing && isEditable) {
                    onTogglePermission(permission.id);
                  }
                }}
                disabled={!isEditing || !isEditable}
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor={`permission-${permission.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {permission.name}
                </label>
                <p className="text-xs text-muted-foreground">
                  {permission.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsCategory;
