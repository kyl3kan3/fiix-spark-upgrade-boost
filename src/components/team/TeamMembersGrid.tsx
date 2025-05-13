
import React from "react";
import TeamMemberCard from "./TeamMemberCard";
import { TeamMember } from "./types";

interface TeamMembersGridProps {
  members: TeamMember[];
  roleColorMap: Record<string, string>;
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
  }) => void;
}

const TeamMembersGrid: React.FC<TeamMembersGridProps> = ({ members, roleColorMap, onMemberUpdated }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <TeamMemberCard 
          key={member.id} 
          member={member}
          roleColorMap={roleColorMap} 
          onMemberUpdated={onMemberUpdated}
        />
      ))}
    </div>
  );
};

export default TeamMembersGrid;
