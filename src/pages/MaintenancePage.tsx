import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";
import UnplannedMaintenanceContent from "@/components/features/UnplannedMaintenanceContent";

const MaintenancePage = () => {
  const [activeTab, setActiveTab] = useState("preventive");
  return (
    <DashboardLayout>
      <PageHeader code="MNT · 001" title="Maintenance" description="Preventive schedules and unplanned interventions." />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
            {[["preventive","Preventive"],["unplanned","Unplanned"]].map(([v,l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 font-display text-sm font-medium text-muted-foreground hover:text-foreground -mb-px">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="preventive" className="mt-0"><PreventiveMaintenanceContent /></TabsContent>
          <TabsContent value="unplanned" className="mt-0"><UnplannedMaintenanceContent /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePage;
