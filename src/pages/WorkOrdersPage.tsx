
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import WorkOrderFilters from "@/components/workOrders/WorkOrderFilters";
import WorkOrderList from "@/components/workOrders/WorkOrderList";
import EmptyWorkOrdersState from "@/components/workOrders/EmptyWorkOrdersState";
import { useWorkOrders } from "@/components/workOrders/useWorkOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WorkOrdersPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    assignee: "all",
  });

  const { workOrders, isLoading } = useWorkOrders();

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = !filters.search || 
      wo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      wo.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === "all" || wo.status === filters.status;
    const matchesPriority = filters.priority === "all" || wo.priority === filters.priority;
    const matchesAssignee = filters.assignee === "all" || wo.assigned_to === filters.assignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <BackToDashboard />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maintenease-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Work Orders</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Create and manage maintenance work orders</p>
          </div>
          <Link to="/work-orders/new">
            <Button className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Create Work Order</span>
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 min-w-[200px]">
              <TabsTrigger value="list" className="text-xs sm:text-sm">List View</TabsTrigger>
              <TabsTrigger value="board" className="text-xs sm:text-sm">Board View</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="mt-0 space-y-4 sm:space-y-6">
            <WorkOrderFilters filters={filters} setFilters={setFilters} />
            
            {filteredWorkOrders.length === 0 ? (
              <EmptyWorkOrdersState hasWorkOrders={workOrders.length > 0} />
            ) : (
              <WorkOrderList workOrders={filteredWorkOrders} />
            )}
          </TabsContent>
          
          <TabsContent value="board" className="mt-0">
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-gray-500">Board view coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
