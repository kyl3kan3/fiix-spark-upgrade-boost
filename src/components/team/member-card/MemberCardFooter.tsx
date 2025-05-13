
import React, { useState, useEffect } from "react";
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
  const [displayRole, setDisplayRole] = useState(currentRole);
  
  // Update the displayed role when the prop changes
  useEffect(() => {
    console.log(`MemberCardFooter: currentRole changed to ${currentRole}`);
    setDisplayRole(currentRole);
  }, [currentRole]);
  
  // Function to handle role updates
  const handleRoleUpdated = (role: string) => {
    console.log(`MemberCardFooter: role updated to ${role}`);
    setDisplayRole(role);
    onRoleUpdated(role);
  };
  
  // Always ensure userId is a string as required by the UserRoleSelector
  const userIdString = userId.toString();
  
  return (
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
      <span className="text-sm font-medium">Role Access</span>
      <UserRoleSelector 
        userId={userIdString} 
        currentRole={displayRole} 
        onRoleUpdated={handleRoleUpdated}
      />
    </div>
  );
};

export default MemberCardFooter;
