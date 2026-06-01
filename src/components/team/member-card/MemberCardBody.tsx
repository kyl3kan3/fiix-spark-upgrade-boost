
import React from "react";
import MemberAvatar from "./MemberAvatar";
import MemberInfo from "./MemberInfo";
import MemberActions from "./MemberActions";
import UserInfoEditor from "../UserInfoEditor";
import { TeamMember } from "../types";

interface MemberCardBodyProps {
 member: TeamMember;
 roleColorMap: Record<string, string>;
 isEditing: boolean;
 setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
 handleUserInfoUpdated: (updates: {
 firstName?: string;
 lastName?: string;
 email?: string;
 phone?: string;
 }) => void;
}

const MemberCardBody: React.FC<MemberCardBodyProps> = ({
 member,
 roleColorMap,
 isEditing,
 setIsEditing,
 handleUserInfoUpdated
}) => {
 return (
 <div className="p-6 relative flex flex-col items-center text-center gap-3 flex-1">
 <MemberActions onEditClick={() => setIsEditing(true)} />

 <MemberAvatar
 avatar={member.avatar}
 online={member.online ?? false}
 />
 <MemberInfo member={member} roleColorMap={roleColorMap} />

 <UserInfoEditor
 open={isEditing}
 onOpenChange={setIsEditing}
 user={{
 id: member.id.toString(),
 name: member.name,
 email: member.email,
 phone: member.phone || "",
 firstName: member.firstName,
 lastName: member.lastName,
 }}
 onUserUpdated={handleUserInfoUpdated}
 />
 </div>
 );
};

export default MemberCardBody;
