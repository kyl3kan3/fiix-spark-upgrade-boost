
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import WorkOrderFilters from "@/components/workOrders/WorkOrderFilters";
import WorkOrderList from "@/components/workOrders/WorkOrderList";
import WorkOrderBoardView from "@/components/workOrders/WorkOrderBoardView";
import EmptyWorkOrdersState from "@/components/workOrders/EmptyWorkOrdersState";
import { useWorkOrders } from "@/components/workOrders/useWorkOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WorkOrdersPage = () => {
  const { workOrders, isLoading, filters, updateFilters } = useWorkOrders();

  const resetFilters = () => {
    updateFilters({
      searchQuery: "",
      statusFilter: "all",
      priorityFilter: "all"
    });
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = !filters.searchQuery || 
      wo.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      wo.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesStatus = filters.statusFilter === "all" || wo.status === filters.statusFilter;
    const matchesPriority = filters.priorityFilter === "all" || wo.priority === filters.priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
            <WorkOrderFilters 
              filters={filters} 
              updateFilters={updateFilters}
              resetFilters={resetFilters}
            />
            
            {filteredWorkOrders.length === 0 ? (
              <EmptyWorkOrdersState />
            ) : (
              <WorkOrderList workOrders={filteredWorkOrders} />
            )}
          </TabsContent>
          
          <TabsContent value="board" className="mt-0 space-y-4 sm:space-y-6">
            <WorkOrderFilters 
              filters={filters} 
              updateFilters={updateFilters}
              resetFilters={resetFilters}
            />
            
            {filteredWorkOrders.length === 0 ? (
              <EmptyWorkOrdersState />
            ) : (
              <WorkOrderBoardView workOrders={filteredWorkOrders} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
