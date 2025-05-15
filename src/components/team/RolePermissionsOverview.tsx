
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RolePermissionsOverview: React.FC = () => {
  return (
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
  );
};

export default RolePermissionsOverview;
