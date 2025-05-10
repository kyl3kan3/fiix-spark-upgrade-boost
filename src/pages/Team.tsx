
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Mail, Phone } from "lucide-react";

const Team = () => {
  const teamMembers = [
    { id: 1, name: "John Smith", role: "Maintenance Manager", email: "john@example.com", phone: "+1 (555) 123-4567", avatar: "JS" },
    { id: 2, name: "Sarah Johnson", role: "Technician", email: "sarah@example.com", phone: "+1 (555) 234-5678", avatar: "SJ" },
    { id: 3, name: "Michael Lee", role: "Technician", email: "michael@example.com", phone: "+1 (555) 345-6789", avatar: "ML" },
    { id: 4, name: "Emily Davis", role: "Administrator", email: "emily@example.com", phone: "+1 (555) 456-7890", avatar: "ED" },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500">Manage your maintenance team</p>
        </div>
        <Button className="bg-maintenease-600 hover:bg-maintenease-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
          <CardDescription>
            View and manage all maintenance team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-maintenease-100 text-maintenease-600 flex items-center justify-center font-bold text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <div className="mt-2 flex flex-col gap-1">
                        <a href={`mailto:${member.email}`} className="text-sm flex items-center text-blue-600 hover:underline">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </a>
                        <a href={`tel:${member.phone}`} className="text-sm flex items-center text-blue-600 hover:underline">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                  <Button variant="outline" size="sm" className="text-xs">Edit Profile</Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Team;
