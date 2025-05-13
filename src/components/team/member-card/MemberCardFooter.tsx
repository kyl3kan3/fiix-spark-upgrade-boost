
import React from "react";
import UserRoleSelector from "../UserRoleSelector";

interface MemberCardFooterProps {
  userId: string | number;
  currentRole: string;
  onRoleUpdated: (role: string) => void;
}

const MemberCardFooter: React.FC<MemberCardFooterProps> = ({
  userId,
  currentRole,
  onRoleUpdated
}) => {
  // Always ensure userId is a string as required by the UserRoleSelector
  const userIdString = userId.toString();
  
  return (
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
      <span className="text-sm font-medium">Role Access</span>
      <UserRoleSelector 
        userId={userIdString} 
        currentRole={currentRole} 
        onRoleUpdated={onRoleUpdated}
      />
    </div>
  );
};

export default MemberCardFooter;
