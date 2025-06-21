
import React, { useState } from "react";
import { Plus, Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrders } from "./useWorkOrders";
import { WorkOrderListView } from "./WorkOrderListView";
import WorkOrderFilters from "./WorkOrderFilters";
import WorkOrderBoardView from "./WorkOrderBoardView";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";
import { useWorkOrderNavigation } from "./hooks/useWorkOrderNavigation";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

export const WorkOrderPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    workOrders,
    isLoading,
    filters,
    updateFilters,
    resetFilters
  } = useWorkOrders();

  const {
    handleCreateWorkOrder,
    handleViewWorkOrder,
    handleEditWorkOrder,
    handleDeleteWorkOrder
  } = useWorkOrderNavigation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (workOrders.length === 0 && !filters.searchQuery && filters.statusFilter === "all" && filters.priorityFilter === "all") {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header with back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <BackToDashboard />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Work Orders</h1>
        </div>
        
        <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4">
        <BackToDashboard />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Work Orders</h1>
      </div>

      {/* Actions and description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Manage and track maintenance work orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "board" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleCreateWorkOrder} className="bg-maintenease-600 hover:bg-maintenease-700">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">New Work Order</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderFilters
              filters={filters}
              updateFilters={updateFilters}
              resetFilters={resetFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {workOrders.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Work Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {workOrders.filter(wo => wo.status === "pending").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {workOrders.filter(wo => wo.status === "in_progress").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {workOrders.filter(wo => wo.status === "completed").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "board")}>
        <TabsContent value="list" className="mt-0">
          <WorkOrderListView
            workOrders={workOrders}
            onView={handleViewWorkOrder}
            onEdit={handleEditWorkOrder}
            onDelete={handleDeleteWorkOrder}
          />
        </TabsContent>
        <TabsContent value="board" className="mt-0">
          <WorkOrderBoardView 
            workOrders={workOrders}
            onView={handleViewWorkOrder}
            onEdit={handleEditWorkOrder}
            onDelete={handleDeleteWorkOrder}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
