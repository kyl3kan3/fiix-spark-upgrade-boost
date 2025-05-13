
import React from "react";
import { TeamMember } from "./types";
import MemberCardBody from "./member-card/MemberCardBody";
import MemberCardFooter from "./member-card/MemberCardFooter";
import { useMemberCardState } from "./member-card/useMemberCardState";

interface TeamMemberProps {
  member: TeamMember;
  roleColorMap: Record<string, string>;
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
  }) => void;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ member, roleColorMap, onMemberUpdated }) => {
  const {
    isEditing,
    setIsEditing,
    handleRoleUpdated,
    handleUserInfoUpdated
  } = useMemberCardState(member.id, onMemberUpdated);

  return (
    <div className="card overflow-hidden border rounded-lg" key={`member-${member.id}-${member.role}`}>
      <MemberCardBody
        member={member}
        roleColorMap={roleColorMap}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleUserInfoUpdated={handleUserInfoUpdated}
      />
      <MemberCardFooter
        userId={member.id}
        currentRole={member.role}
        onRoleUpdated={handleRoleUpdated}
      />
    </div>
  );
};

export default TeamMemberCard;
