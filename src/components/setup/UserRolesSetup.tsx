
import React, { useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface RolePermission {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
  isEditable?: boolean;
}

interface UserRolesSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const defaultPermissions: RolePermission[] = [
  { 
    id: "work_orders_view", 
    name: "View Work Orders", 
    description: "View all work orders in the system", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_create", 
    name: "Create Work Orders", 
    description: "Create new work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_edit", 
    name: "Edit Work Orders", 
    description: "Edit existing work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_delete", 
    name: "Delete Work Orders", 
    description: "Delete existing work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "assets_view", 
    name: "View Assets", 
    description: "View asset information", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_create", 
    name: "Create Assets", 
    description: "Add new assets to the system", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_edit", 
    name: "Edit Assets", 
    description: "Modify asset information", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_delete", 
    name: "Delete Assets", 
    description: "Remove assets from the system", 
    categories: ["Assets"] 
  },
  { 
    id: "users_view", 
    name: "View Users", 
    description: "View user accounts", 
    categories: ["Users"] 
  },
  { 
    id: "users_invite", 
    name: "Invite Users", 
    description: "Send invitations to join the system", 
    categories: ["Users"] 
  },
  { 
    id: "users_manage", 
    name: "Manage Users", 
    description: "Edit user information and roles", 
    categories: ["Users"] 
  },
  { 
    id: "reports_view", 
    name: "View Reports", 
    description: "Access system reports", 
    categories: ["Reports"] 
  },
  { 
    id: "reports_create", 
    name: "Create Reports", 
    description: "Generate custom reports", 
    categories: ["Reports"] 
  },
  { 
    id: "system_settings", 
    name: "System Settings", 
    description: "Modify system configuration", 
    categories: ["Administration"] 
  }
];

const defaultRoles: Role[] = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full access to all system features",
    permissions: defaultPermissions.map(p => p.id),
    isDefault: true,
    isEditable: false
  },
  {
    id: "manager",
    name: "Manager",
    description: "Can manage work orders, assets, and view reports",
    permissions: [
      "work_orders_view", "work_orders_create", "work_orders_edit",
      "assets_view", "assets_create", "assets_edit",
      "users_view", "reports_view", "reports_create"
    ],
    isDefault: true,
    isEditable: true
  },
  {
    id: "technician",
    name: "Technician",
    description: "Field staff that complete work orders",
    permissions: [
      "work_orders_view", "work_orders_edit", 
      "assets_view"
    ],
    isDefault: true,
    isEditable: true
  },
  {
    id: "readonly",
    name: "Read-Only",
    description: "Can only view information, no editing capabilities",
    permissions: [
      "work_orders_view", 
      "assets_view", 
      "reports_view"
    ],
    isDefault: true,
    isEditable: true
  }
];

const UserRolesSetup: React.FC<UserRolesSetupProps> = ({ data, onUpdate }) => {
  const [roles, setRoles] = useState<Role[]>(data?.roles || defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const permissionCategories = [...new Set(defaultPermissions.map(p => p.categories[0]))];

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
          <h3 className="font-medium">Available Roles</h3>
          
          <div className="space-y-2">
            {roles.map((role) => (
              <div 
                key={role.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedRole?.id === role.id ? 'border-maintenease-600 bg-maintenease-50' : ''}`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{role.name}</div>
                  {role.isDefault && <Badge variant="outline">Default</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Input 
              placeholder="New role name" 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="text-sm"
            />
            <Button 
              size="sm" 
              onClick={handleAddRole}
              disabled={!newRoleName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedRole ? (
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
                  const categoryPermissions = defaultPermissions.filter(p => p.categories[0] === category);
                  
                  return (
                    <Card key={category}>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">{category}</h4>
                        <CardDescription className="mb-4">
                          {category === "Work Orders" && "Permissions for managing maintenance tasks"}
                          {category === "Assets" && "Permissions for managing equipment and assets"}
                          {category === "Users" && "Permissions for managing user accounts"}
                          {category === "Reports" && "Permissions for viewing and creating reports"}
                          {category === "Administration" && "System-wide configuration permissions"}
                        </CardDescription>
                        
                        <div className="space-y-3">
                          {categoryPermissions.map((permission) => (
                            <div 
                              key={permission.id} 
                              className="flex items-start space-x-2"
                            >
                              <Checkbox 
                                id={`permission-${permission.id}`}
                                checked={selectedRole.permissions.includes(permission.id)}
                                onCheckedChange={() => {
                                  if (isEditing && selectedRole.isEditable) {
                                    handleTogglePermission(permission.id);
                                  }
                                }}
                                disabled={!isEditing || !selectedRole.isEditable}
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
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full border rounded-md p-8 text-center text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Select a Role</h3>
              <p className="mt-2">
                Choose a role from the left panel to view or edit its permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRolesSetup;
