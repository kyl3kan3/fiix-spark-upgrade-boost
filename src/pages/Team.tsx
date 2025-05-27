
import React, { useState, useCallback, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TeamHeader from "../components/team/TeamHeader";
import TeamFilters from "../components/team/TeamFilters";
import TeamMembersList from "../components/team/TeamMembersList";
import PendingInvitationsSection from "../components/team/PendingInvitationsSection";
import RolePermissionsOverview from "../components/team/RolePermissionsOverview";
import { TeamMember, RoleColorMap } from "../components/team/types";
import { useTeamMembers } from "../hooks/useTeamMembers";
import { usePendingInvitations } from "../hooks/team/usePendingInvitations";
import { toast } from "@/components/ui/use-toast";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import AdminSetDemoCompanyButton from "@/components/team/AdminSetDemoCompanyButton";

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { teamMembers, loading, refreshTeamMembers, updateTeamMember } = useTeamMembers();
  const { pendingInvitations, loading: pendingLoading, refreshPendingInvitations } = usePendingInvitations();
  
  // Force refresh when component mounts to ensure we have the latest data
  useEffect(() => {
    console.log("Team component mounted, refreshing team members data");
    refreshTeamMembers();
    refreshPendingInvitations();
  }, [refreshTeamMembers, refreshPendingInvitations, refreshTrigger]);
  
  // Convert ChatUser type to TeamMember type
  const mappedMembers: TeamMember[] = teamMembers.map(member => ({
    id: member.id, // Keep original string id
    name: member.name,
    role: member.role || "viewer",
    email: member.email,
    phone: member.phone || "+1 (555) 123-4567", // Use member phone if available
    avatar: member.avatar || member.name.substring(0, 2).toUpperCase(),
    joined: "Recently", // This info isn't available in ChatUser
    lastActive: member.online ? "Just now" : "Recently",
    firstName: member.firstName,
    lastName: member.lastName,
    companyName: member.companyName,
    online: member.online
  }));

  const roleColorMap: RoleColorMap = {
    administrator: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    technician: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800"
  };

  const filteredMembers = mappedMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleMemberUpdated = useCallback((userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }) => {
    console.log("Member update in Team.tsx:", userId, updates);
    updateTeamMember(userId, updates)
      .then((result) => {
        if (result.success) {
          toast("Team member information updated");
          setRefreshTrigger(prev => prev + 1);
          refreshTeamMembers();
        } else {
          console.error("Update failed:", result.error);
          toast("Failed to update team member");
        }
      });
  }, [updateTeamMember, refreshTeamMembers]);

  return (
    <DashboardLayout>
      <BackToDashboard />
      {/* Add the demo company admin button at the top */}
      <div className="mb-4">
        <AdminSetDemoCompanyButton />
      </div>
      <TeamHeader />
      <TeamFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />
      
      {/* Pending Invitations Section */}
      <div className="mb-6">
        <PendingInvitationsSection 
          invitations={pendingInvitations}
          roleColorMap={roleColorMap}
          loading={pendingLoading}
        />
      </div>
      
      <TeamMembersList 
        members={filteredMembers} 
        roleColorMap={roleColorMap}
        loading={loading}
        onMemberUpdated={handleMemberUpdated}
      />
      <RolePermissionsOverview />
    </DashboardLayout>
  );
};

export default Team;
