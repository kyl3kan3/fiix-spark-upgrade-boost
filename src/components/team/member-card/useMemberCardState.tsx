
import { useState } from "react";

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
    console.log("Role updated for member:", memberId, "to role:", role);
    onMemberUpdated(memberId.toString(), { role });
  };

  const handleUserInfoUpdated = (updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) => {
    console.log("User info update:", updates);
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
