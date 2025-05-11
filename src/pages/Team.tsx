
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, Mail, Phone, 
  Users, UserPlus, Filter, Calendar 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserRoleSelector from "../components/team/UserRoleSelector";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const teamMembers = [
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

  const roleColorMap: Record<string, string> = {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500">Manage your maintenance team and permissions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-maintenease-600 hover:bg-maintenease-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Enter the details of the new team member to invite them to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">Name</label>
                <Input className="col-span-3" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">Email</label>
                <Input className="col-span-3" type="email" placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">Role</label>
                <Select defaultValue="technician" className="col-span-3">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="administrator">Administrators</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="technician">Technicians</SelectItem>
            <SelectItem value="viewer">Viewers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
          <CardDescription>
            View and manage permissions for all maintenance team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-lg">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge className={`${roleColorMap[member.role]} mt-1 font-normal`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      <div className="mt-3 flex flex-col gap-1">
                        <a href={`mailto:${member.email}`} className="text-sm flex items-center text-blue-600 hover:underline">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </a>
                        <a href={`tel:${member.phone}`} className="text-sm flex items-center text-blue-600 hover:underline">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </a>
                        <div className="text-xs text-gray-500 mt-2">
                          <div>Joined: {member.joined}</div>
                          <div>Last active: {member.lastActive}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Role Access</span>
                  <UserRoleSelector userId={member.id.toString()} currentRole={member.role} />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Review the access levels for each role in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Administrator",
                      description: "Full access to all system features and settings",
                      permissions: ["Manage users", "Configure system", "Delete records", "All other permissions"]
                    },
                    {
                      title: "Manager",
                      description: "Can manage work orders and assets",
                      permissions: ["Create/edit work orders", "Assign technicians", "Generate reports", "View all records"]
                    },
                    {
                      title: "Technician",
                      description: "Field staff responsible for completing work orders",
                      permissions: ["Update work orders", "Add comments", "View assigned tasks", "Limited reporting"]
                    },
                    {
                      title: "Viewer",
                      description: "Read-only access to system data",
                      permissions: ["View work orders", "View assets", "View reports", "No edit capabilities"]
                    }
                  ].map((role) => (
                    <Card key={role.title} className="border-t-4" style={{ borderTopColor: role.title === 'Administrator' ? '#ef4444' : role.title === 'Manager' ? '#3b82f6' : role.title === 'Technician' ? '#22c55e' : '#6b7280' }}>
                      <CardHeader>
                        <CardTitle>{role.title}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {role.permissions.map((permission, idx) => (
                            <li key={idx}>{permission}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="detailed">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Feature</th>
                      <th className="border p-2 text-center">Administrator</th>
                      <th className="border p-2 text-center">Manager</th>
                      <th className="border p-2 text-center">Technician</th>
                      <th className="border p-2 text-center">Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "View Work Orders", admin: true, manager: true, technician: true, viewer: true },
                      { feature: "Create Work Orders", admin: true, manager: true, technician: false, viewer: false },
                      { feature: "Edit Work Orders", admin: true, manager: true, technician: true, viewer: false },
                      { feature: "Delete Work Orders", admin: true, manager: true, technician: false, viewer: false },
                      { feature: "Assign Work Orders", admin: true, manager: true, technician: false, viewer: false },
                      { feature: "View Assets", admin: true, manager: true, technician: true, viewer: true },
                      { feature: "Manage Assets", admin: true, manager: true, technician: false, viewer: false },
                      { feature: "User Management", admin: true, manager: false, technician: false, viewer: false },
                      { feature: "System Configuration", admin: true, manager: false, technician: false, viewer: false },
                      { feature: "Generate Reports", admin: true, manager: true, technician: false, viewer: true },
                      { feature: "Export Data", admin: true, manager: true, technician: false, viewer: false },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b">
                        <td className="border-x p-2 font-medium">{row.feature}</td>
                        <td className="border-x p-2 text-center">{row.admin ? "✅" : "❌"}</td>
                        <td className="border-x p-2 text-center">{row.manager ? "✅" : "❌"}</td>
                        <td className="border-x p-2 text-center">{row.technician ? "✅" : "❌"}</td>
                        <td className="border-x p-2 text-center">{row.viewer ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Team;
