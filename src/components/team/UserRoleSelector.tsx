
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleSelectorProps {
  userId: string;
  currentRole: string;
}

const roles = [
  { value: "administrator", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "technician", label: "Technician" },
  { value: "viewer", label: "Viewer" }
];

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ userId, currentRole }) => {
  const [role, setRole] = useState<string>(currentRole);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);

  const handleRoleChange = (newRole: string) => {
    if (newRole !== role) {
      setRole(newRole);
      setIsChanged(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update user role in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success(`Role updated to ${role}`);
      setIsChanged(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
      
      {isChanged && (
        <Button 
          size="sm" 
          className="px-3" 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default UserRoleSelector;
