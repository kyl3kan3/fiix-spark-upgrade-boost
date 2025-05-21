
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export const useMemberCardState = (
  memberId: string | number, 
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
  }) => void
) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleRoleUpdated = (role: string) => {
    try {
      onMemberUpdated(memberId.toString(), { role });
      toast(`User role has been updated to ${role}`);
    } catch (error) {
      console.error("Error in handleRoleUpdated:", error);
      toast("Failed to update role. Please try again.");
    }
  };

  const handleUserInfoUpdated = (updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) => {
    onMemberUpdated(memberId.toString(), updates);
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    handleRoleUpdated,
    handleUserInfoUpdated
  };
};
