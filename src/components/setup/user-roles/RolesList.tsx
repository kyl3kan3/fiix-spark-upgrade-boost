
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Role } from "./types";

interface RolesListProps {
  roles: Role[];
  selectedRole: Role | null;
  newRoleName: string;
  onRoleSelect: (role: Role) => void;
  onNewRoleNameChange: (name: string) => void;
  onAddRole: () => void;
}

const RolesList: React.FC<RolesListProps> = ({
  roles,
  selectedRole,
  newRoleName,
  onRoleSelect,
  onNewRoleNameChange,
  onAddRole,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Available Roles</h3>
      
      <div className="space-y-2">
        {roles.map((role) => (
          <div 
            key={role.id}
            className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedRole?.id === role.id ? 'border-maintenease-600 bg-maintenease-50' : ''}`}
            onClick={() => onRoleSelect(role)}
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
          onChange={(e) => onNewRoleNameChange(e.target.value)}
          className="text-sm"
        />
        <Button 
          size="sm" 
          onClick={onAddRole}
          disabled={!newRoleName.trim()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};

export default RolesList;
