
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
 companyName?: string;
 }) => void;
}

const TeamMembersGrid: React.FC<TeamMembersGridProps> = ({ members, roleColorMap, onMemberUpdated }) => {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
