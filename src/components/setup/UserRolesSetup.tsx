
import React, { useState } from "react";
import { Users } from "lucide-react";
import { Role } from "./user-roles/types";
import { defaultPermissions, defaultRoles } from "./user-roles/defaultData";
import RolesList from "./user-roles/RolesList";
import PermissionsPanel from "./user-roles/PermissionsPanel";
import { UserRolesSetupProps } from "./user-roles/types";

const UserRolesSetup: React.FC<UserRolesSetupProps> = ({ data, onUpdate }) => {
  const [roles, setRoles] = useState<Role[]>(data?.roles || defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(false);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    
    const newRole: Role = {
      id: newRoleName.toLowerCase().replace(/\s/g, '_'),
      name: newRoleName,
      description: "Custom role",
      permissions: [],
      isDefault: false,
      isEditable: true
    };
    
    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    setSelectedRole(newRole);
    setIsEditing(true);
    setNewRoleName("");
    onUpdate({ roles: updatedRoles });
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedRole || !selectedRole.isEditable) return;

    const updatedRole = { ...selectedRole };
    
    if (updatedRole.permissions.includes(permissionId)) {
      updatedRole.permissions = updatedRole.permissions.filter(p => p !== permissionId);
    } else {
      updatedRole.permissions = [...updatedRole.permissions, permissionId];
    }
    
    const updatedRoles = roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    setRoles(updatedRoles);
    setSelectedRole(updatedRole);
    onUpdate({ roles: updatedRoles });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">User Roles & Permissions</h2>
      </div>
      
      <p className="text-muted-foreground">
        Configure the user roles for your organization and set appropriate permissions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <RolesList
            roles={roles}
            selectedRole={selectedRole}
            newRoleName={newRoleName}
            onRoleSelect={handleRoleSelect}
            onNewRoleNameChange={setNewRoleName}
            onAddRole={handleAddRole}
          />
        </div>
        
        <div className="md:col-span-2">
          <PermissionsPanel
            selectedRole={selectedRole}
            permissions={defaultPermissions}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onTogglePermission={handleTogglePermission}
          />
        </div>
      </div>
    </div>
  );
};

export default UserRolesSetup;
