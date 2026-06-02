
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roleBorderClass = (title: string) => {
 switch (title) {
 case "Administrator": return "border-t-destructive";
 case "Manager": return "border-t-primary";
 case "Technician": return "border-t-success";
 default: return "border-t-muted-foreground";
 }
};

const RolePermissionsOverview: React.FC = () => {
 return (
 <div className="mt-2">
 <Card className="bg-card border border-border shadow-sm">
 <CardHeader>
 <CardTitle className="font-headline text-xl text-foreground">Role Permissions</CardTitle>
 <CardDescription>
 Review the access levels for each role in the system
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Tabs defaultValue="overview">
 <TabsList className="mb-4 bg-card border border-border">
 <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
 <TabsTrigger value="detailed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Detailed Permissions</TabsTrigger>
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
 <Card key={role.title} className={`border-t-4 bg-card border border-border shadow-sm hover:shadow-md transition-shadow ${roleBorderClass(role.title)}`}>
 <CardHeader className="pb-2">
 <CardTitle className="font-headline text-base text-foreground">{role.title}</CardTitle>
 <CardDescription className="text-xs">{role.description}</CardDescription>
 </CardHeader>
 <CardContent>
 <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
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
 <div className="overflow-x-auto">
 <table className="w-full min-w-[560px] border-collapse">
 <thead>
 <tr className="bg-muted">
 <th className="border border-border p-2 text-left text-sm font-semibold text-foreground">Feature</th>
 <th className="border border-border p-2 text-center text-sm font-semibold text-foreground">Administrator</th>
 <th className="border border-border p-2 text-center text-sm font-semibold text-foreground">Manager</th>
 <th className="border border-border p-2 text-center text-sm font-semibold text-foreground">Technician</th>
 <th className="border border-border p-2 text-center text-sm font-semibold text-foreground">Viewer</th>
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
 <tr key={row.feature} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="border-x border-border p-2 font-medium text-sm text-foreground">{row.feature}</td>
 <td className="border-x border-border p-2 text-center text-sm">{row.admin ? <span className="text-success">✓</span> : <span className="text-muted-foreground">–</span>}</td>
 <td className="border-x border-border p-2 text-center text-sm">{row.manager ? <span className="text-success">✓</span> : <span className="text-muted-foreground">–</span>}</td>
 <td className="border-x border-border p-2 text-center text-sm">{row.technician ? <span className="text-success">✓</span> : <span className="text-muted-foreground">–</span>}</td>
 <td className="border-x border-border p-2 text-center text-sm">{row.viewer ? <span className="text-success">✓</span> : <span className="text-muted-foreground">–</span>}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </TabsContent>
 </Tabs>
 </CardContent>
 </Card>
 </div>
 );
};

export default RolePermissionsOverview;
