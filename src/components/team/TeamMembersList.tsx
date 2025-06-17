
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";
import TeamMembersLoading from "./TeamMembersLoading";
import TeamMembersEmpty from "./TeamMembersEmpty";
import TeamMembersGrid from "./TeamMembersGrid";
import TeamMembersPermissionFooter from "./TeamMembersPermissionFooter";

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  online?: boolean;
}

interface TeamMembersListProps {
  members: TeamMember[];
  roleColorMap: Record<string, string>;
  loading?: boolean;
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  members, 
  roleColorMap, 
  loading = false,
  onMemberUpdated
}) => {
  const { currentUserRole, checkingPermissions } = useUserRolePermissions();
  
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
          <TeamMembersLoading />
        ) : members.length > 0 ? (
          <TeamMembersGrid 
            members={members}
            roleColorMap={roleColorMap}
            onMemberUpdated={onMemberUpdated}
          />
        ) : (
          <TeamMembersEmpty />
        )}
      </CardContent>
      
      <TeamMembersPermissionFooter currentUserRole={currentUserRole || 'viewer'} />
    </Card>
  );
};

export default TeamMembersList;
