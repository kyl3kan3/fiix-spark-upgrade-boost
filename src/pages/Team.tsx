
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import TeamHeader from "@/components/team/TeamHeader";
import TeamMembersList from "@/components/team/TeamMembersList";
import TeamMembersGrid from "@/components/team/TeamMembersGrid";
import PendingInvitationsSection from "@/components/team/PendingInvitationsSection";
import RolePermissionsOverview from "@/components/team/RolePermissionsOverview";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const Team = () => {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { teamMembers, loading } = useTeamMembers();

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = !filters.search || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = filters.role === "all" || member.role === filters.role;
    
    return matchesSearch && matchesRole;
  });

  // Transform chat users to team members format
  const transformedMembers = filteredMembers.map(member => ({
    ...member,
    first_name: member.firstName,
    last_name: member.lastName,
    joined: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    status: 'active' as const,
    phone: member.phone || '',
    companyName: member.companyName || ''
  }));

  // Role color mapping
  const roleColorMap = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    technician: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  };

  // Handle member updates
  const handleMemberUpdated = (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }) => {
    console.log('Member updated:', userId, updates);
    // This would typically update the member data
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <BackToDashboard />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maintenease-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TeamHeader />
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Add Member</span>
          </Button>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 min-w-[300px]">
              <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
              <TabsTrigger value="invitations" className="text-xs sm:text-sm">Invitations</TabsTrigger>
              <TabsTrigger value="roles" className="text-xs sm:text-sm">Roles</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="members" className="mt-0 space-y-4 sm:space-y-6">
            {viewMode === "grid" ? (
              <TeamMembersGrid 
                members={transformedMembers}
                roleColorMap={roleColorMap}
                onMemberUpdated={handleMemberUpdated}
              />
            ) : (
              <TeamMembersList 
                members={transformedMembers} 
                roleColorMap={roleColorMap}
                loading={loading}
                onMemberUpdated={handleMemberUpdated}
              />
            )}
          </TabsContent>
          
          <TabsContent value="invitations" className="mt-0">
            <PendingInvitationsSection invitations={[]} roleColorMap={roleColorMap} />
          </TabsContent>
          
          <TabsContent value="roles" className="mt-0">
            <RolePermissionsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Team;
