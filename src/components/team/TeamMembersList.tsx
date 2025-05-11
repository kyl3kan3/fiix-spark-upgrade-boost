
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "./TeamMemberCard";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
}

interface TeamMembersListProps {
  members: TeamMember[];
  roleColorMap: Record<string, string>;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ members, roleColorMap }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          View and manage permissions for all maintenance team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} roleColorMap={roleColorMap} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMembersList;
