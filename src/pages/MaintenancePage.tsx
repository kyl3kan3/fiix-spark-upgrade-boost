import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";
import UnplannedMaintenanceContent from "@/components/features/UnplannedMaintenanceContent";
import { Plus } from "lucide-react";

const MaintenancePage = () => {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState("preventive");
 return (
 <DashboardLayout>
 <PageHeader
 title="PM Scheduler"
 description="Manage and forecast preventive maintenance tasks."
 actions={
 <Button size="lg" onClick={() => navigate("/work-orders/new")}>
 <Plus className="h-4 w-4 mr-1.5" />
 Create New Schedule
 </Button>
 }
 />
 <div className="px-4 md:px-6 lg:px-8 py-6">
 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
 <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
 {[["preventive", "Preventive"], ["unplanned", "Unplanned"]].map(([v, l]) => (
 <TabsTrigger
 key={v}
 value={v}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 {l}
 </TabsTrigger>
 ))}
 </TabsList>
 <TabsContent value="preventive" className="mt-0">
 <PreventiveMaintenanceContent />
 </TabsContent>
 <TabsContent value="unplanned" className="mt-0">
 <UnplannedMaintenanceContent />
 </TabsContent>
 </Tabs>
 </div>
 </DashboardLayout>
 );
};

export default MaintenancePage;
