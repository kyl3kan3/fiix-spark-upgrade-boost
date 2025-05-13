
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/team/useCurrentUserRole";
import { updateUserRole } from "@/services/roleService";
import RoleEditMode from "./roles/RoleEditMode";
import RoleDisplayMode from "./roles/RoleDisplayMode";

interface UserRoleSelectorProps {
  userId: string;
  currentRole: string;
  onRoleUpdated: (role: string) => void;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ 
  userId, 
  currentRole, 
  onRoleUpdated 
}) => {
  const [role, setRole] = useState<string>(currentRole);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const { currentUserRole, isLoading, canEditRoles } = useCurrentUserRole();
  
  // This will ensure that if the currentRole prop changes externally, our component updates
  useEffect(() => {
    console.log(`UserRoleSelector: currentRole prop changed to ${currentRole}`);
    setRole(currentRole);
    setIsChanged(false);
  }, [currentRole]);

  const handleRoleChange = (newRole: string) => {
    if (newRole !== role) {
      console.log(`Role changed from ${role} to ${newRole}`);
      setRole(newRole);
      setIsChanged(true);
    }
  };

  const handleSave = async () => {
    try {
      // Only administrators can change roles
      if (!canEditRoles) {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to change roles",
          variant: "destructive"
        });
        throw new Error("You do not have permission to change roles");
      }
      
      setIsSaving(true);
      console.log(`Attempting to update role for user ${userId} to ${role}`);
      
      const result = await updateUserRole(userId, role);
      
      if (result.success) {
        console.log("Role update successful:", result.data);
        toast({
          title: "Role Updated",
          description: `Role updated to ${role}`
        });
        setIsChanged(false);
        setIsEditing(false);
        
        // Call the callback function to trigger data refresh in parent component
        onRoleUpdated(role);
      } else {
        console.error("Role update failed:", result.error);
        throw result.error || new Error("Unknown error occurred");
      }
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    if (!canEditRoles) {
      toast({
        title: "Permission Denied",
        description: "You need administrator privileges to change user roles",
        variant: "destructive"
      });
      return;
    }
    
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset to current role when entering edit mode
      setRole(currentRole);
      setIsChanged(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-[140px] text-sm">Loading permissions...</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <RoleEditMode
          role={role}
          handleRoleChange={handleRoleChange}
          handleSave={handleSave}
          toggleEdit={toggleEdit}
          isSaving={isSaving}
          isChanged={isChanged}
        />
      ) : (
        <RoleDisplayMode
          currentRole={currentRole}
          toggleEdit={toggleEdit}
          canEditRoles={canEditRoles}
        />
      )}
    </div>
  );
};

export default UserRoleSelector;
