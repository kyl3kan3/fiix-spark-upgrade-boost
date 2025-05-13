
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
  return (
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
      <span className="text-sm font-medium">Role Access</span>
      <UserRoleSelector 
        userId={userId.toString()} 
        currentRole={currentRole} 
        onRoleUpdated={onRoleUpdated}
      />
    </div>
  );
};

export default MemberCardFooter;
