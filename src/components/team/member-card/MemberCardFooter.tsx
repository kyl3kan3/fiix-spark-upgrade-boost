
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
 setDisplayRole(currentRole);
 }, [currentRole]);
 
 // Function to handle role updates
 const handleRoleUpdated = (role: string) => {
 setDisplayRole(role);
 onRoleUpdated(role);
 };
 
 // Always ensure userId is a string as required by the UserRoleSelector
 const userIdString = userId.toString();
 
 return (
 <div className="border-t border-border bg-background/50 px-5 py-3 flex items-center justify-between rounded-b-lg">
 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
 <UserRoleSelector
 userId={userIdString}
 currentRole={displayRole}
 onRoleUpdated={handleRoleUpdated}
 />
 </div>
 );
};

export default MemberCardFooter;
