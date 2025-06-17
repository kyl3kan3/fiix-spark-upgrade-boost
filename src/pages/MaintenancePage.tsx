
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";
import UnplannedMaintenanceContent from "@/components/features/UnplannedMaintenanceContent";

const MaintenancePage = () => {
  const [activeTab, setActiveTab] = useState("preventive");

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Management</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="preventive">Preventive Maintenance</TabsTrigger>
            <TabsTrigger value="unplanned">Unplanned Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preventive" className="mt-6">
            <PreventiveMaintenanceContent />
          </TabsContent>
          
          <TabsContent value="unplanned" className="mt-6">
            <UnplannedMaintenanceContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePage;
