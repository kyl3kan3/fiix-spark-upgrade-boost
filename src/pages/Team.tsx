
import React, { useState, useCallback } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TeamHeader from "../components/team/TeamHeader";
import TeamFilters from "../components/team/TeamFilters";
import TeamMembersList from "../components/team/TeamMembersList";
import RolePermissionsOverview from "../components/team/RolePermissionsOverview";
import { TeamMember, RoleColorMap } from "../components/team/types";
import { useTeamMembers } from "../hooks/useTeamMembers";

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { teamMembers, loading, refetchMembers } = useTeamMembers();
  
  // Convert ChatUser type to TeamMember type
  const mappedMembers: TeamMember[] = teamMembers.map(member => ({
    id: member.id, // Keep original string id
    name: member.name,
    role: member.role || "viewer",
    email: member.email,
    phone: "+1 (555) 123-4567", // Default phone as this isn't in the ChatUser type
    avatar: member.avatar || member.name.substring(0, 2).toUpperCase(),
    joined: "Recently", // This info isn't available in ChatUser
    lastActive: member.online ? "Just now" : "Recently"
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

  const handleMemberUpdated = useCallback(() => {
    console.log("Member updated, refreshing data...");
    refetchMembers();
  }, [refetchMembers]);

  return (
    <DashboardLayout>
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
