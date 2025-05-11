
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TeamHeader from "../components/team/TeamHeader";
import TeamFilters from "../components/team/TeamFilters";
import TeamMembersList from "../components/team/TeamMembersList";
import RolePermissionsOverview from "../components/team/RolePermissionsOverview";
import { TeamMember, RoleColorMap } from "../components/team/types";

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const teamMembers: TeamMember[] = [
    { 
      id: 1, 
      name: "John Smith", 
      role: "administrator", 
      email: "john@example.com", 
      phone: "+1 (555) 123-4567", 
      avatar: "JS",
      joined: "3 years ago",
      lastActive: "2 hours ago"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      role: "technician", 
      email: "sarah@example.com", 
      phone: "+1 (555) 234-5678", 
      avatar: "SJ",
      joined: "1 year ago",
      lastActive: "Just now"
    },
    { 
      id: 3, 
      name: "Michael Lee", 
      role: "technician", 
      email: "michael@example.com", 
      phone: "+1 (555) 345-6789", 
      avatar: "ML",
      joined: "2 years ago",
      lastActive: "3 days ago"
    },
    { 
      id: 4, 
      name: "Emily Davis", 
      role: "manager", 
      email: "emily@example.com", 
      phone: "+1 (555) 456-7890", 
      avatar: "ED",
      joined: "6 months ago",
      lastActive: "1 day ago"
    },
    { 
      id: 5, 
      name: "Robert Wilson", 
      role: "viewer", 
      email: "robert@example.com", 
      phone: "+1 (555) 567-8901", 
      avatar: "RW",
      joined: "1 month ago",
      lastActive: "1 week ago"
    },
  ];

  const roleColorMap: RoleColorMap = {
    administrator: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    technician: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800"
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

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
      />
      <RolePermissionsOverview />
    </DashboardLayout>
  );
};

export default Team;
