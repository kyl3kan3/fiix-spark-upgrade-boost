
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "./TeamMemberCard";
import { Loader2 } from "lucide-react";

interface TeamMember {
  id: string | number;  // Support both string and number types
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
  loading?: boolean;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ members, roleColorMap, loading = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          View and manage permissions for all maintenance team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-maintenease-600 animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <TeamMemberCard 
                key={member.id} 
                member={{
                  ...member,
                  id: typeof member.id === 'string' ? parseInt(member.id) : member.id
                }} 
                roleColorMap={roleColorMap} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No team members found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMembersList;
