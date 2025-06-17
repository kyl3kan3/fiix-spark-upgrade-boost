
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkOrderList from "@/components/workOrders/WorkOrderList";
import WorkOrderBoardView from "@/components/workOrders/WorkOrderBoardView";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

const WorkOrdersPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<"list" | "board">("list");
  const { workOrders, isLoading, error } = useWorkOrdersData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-red-500">
          Error loading work orders. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Work Orders | MaintenEase</title>
      </Helmet>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Orders</h1>
          
          <Tabs value={currentView} onValueChange={(value: string) => setCurrentView(value as "list" | "board")}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={currentView} className="w-full">
          <TabsContent value="list" className="mt-0">
            <WorkOrderList />
          </TabsContent>
          
          <TabsContent value="board" className="mt-0">
            <WorkOrderBoardView workOrders={workOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
