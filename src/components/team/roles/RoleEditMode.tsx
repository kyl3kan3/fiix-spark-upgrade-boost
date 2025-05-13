
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, CheckIcon } from "lucide-react";
import { roles } from "./roleDefinitions";

interface RoleEditModeProps {
  role: string;
  handleRoleChange: (newRole: string) => void;
  handleSave: () => void;
  toggleEdit: () => void;
  isSaving: boolean;
  isChanged: boolean;
}

const RoleEditMode: React.FC<RoleEditModeProps> = ({
  role,
  handleRoleChange,
  handleSave,
  toggleEdit,
  isSaving,
  isChanged
}) => {
  return (
    <>
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        size="sm" 
        className="px-3" 
        onClick={handleSave} 
        disabled={isSaving || !isChanged}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckIcon className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="px-3" 
        onClick={toggleEdit}
        disabled={isSaving}
      >
        Cancel
      </Button>
    </>
  );
};

export default RoleEditMode;
