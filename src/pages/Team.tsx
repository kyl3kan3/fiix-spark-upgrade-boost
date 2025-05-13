
import React, { useState, useCallback, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TeamHeader from "../components/team/TeamHeader";
import TeamFilters from "../components/team/TeamFilters";
import TeamMembersList from "../components/team/TeamMembersList";
import RolePermissionsOverview from "../components/team/RolePermissionsOverview";
import { TeamMember, RoleColorMap } from "../components/team/types";
import { useTeamMembers } from "../hooks/useTeamMembers";
import { toast } from "sonner";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { teamMembers, loading, refreshTeamMembers, updateTeamMember } = useTeamMembers();
  
  // Force refresh when component mounts to ensure we have the latest data
  useEffect(() => {
    console.log("Team component mounted, refreshing team members data");
    refreshTeamMembers();
  }, [refreshTeamMembers]);
  
  // Convert ChatUser type to TeamMember type
  const mappedMembers: TeamMember[] = teamMembers.map(member => ({
    id: member.id, // Keep original string id
    name: member.name,
    role: member.role || "viewer",
    email: member.email,
    phone: "+1 (555) 123-4567", // Default phone as this isn't in the ChatUser type
    avatar: member.avatar || member.name.substring(0, 2).toUpperCase(),
    joined: "Recently", // This info isn't available in ChatUser
    lastActive: member.online ? "Just now" : "Recently",
    firstName: member.firstName,
    lastName: member.lastName,
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

  const handleMemberUpdated = useCallback(async (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
  }) => {
    const result = await updateTeamMember(userId, updates);
    if (result.success) {
      toast.success("Team member information updated");
    }
  }, [updateTeamMember]);

  return (
    <DashboardLayout>
      <BackToDashboard />
      <TeamHeader />
      <TeamFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />
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
