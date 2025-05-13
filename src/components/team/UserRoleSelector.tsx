
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleSelectorProps {
  userId: string;
  currentRole: string;
  onRoleUpdated: (role: string) => void;
}

const roles = [
  { value: "administrator", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "technician", label: "Technician" },
  { value: "viewer", label: "Viewer" }
];

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ userId, currentRole, onRoleUpdated }) => {
  const [role, setRole] = useState<string>(currentRole);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // This will ensure that if the currentRole prop changes externally, our component updates
  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (newRole: string) => {
    if (newRole !== role) {
      setRole(newRole);
      setIsChanged(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      console.log("Updating role for user ID:", userId, "to role:", role);
      
      // Ensure we're working with a valid user ID
      if (!userId) {
        throw new Error("Invalid user ID");
      }
      
      // Update user role in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Role update response:", data);
      toast.success(`Role updated to ${role}`);
      setIsChanged(false);
      setIsEditing(false);
      
      // Call the callback function to trigger data refresh in parent component
      onRoleUpdated(role);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset to current role when entering edit mode
      setRole(currentRole);
      setIsChanged(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
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
      ) : (
        <>
          <span className="w-[140px] text-sm">{roles.find(r => r.value === currentRole)?.label || currentRole}</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3" 
            onClick={toggleEdit}
          >
            Edit
          </Button>
        </>
      )}
    </div>
  );
};

export default UserRoleSelector;
