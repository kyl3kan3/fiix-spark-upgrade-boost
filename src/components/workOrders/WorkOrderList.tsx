
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkOrders } from "./useWorkOrders";
import WorkOrderFilters from "./WorkOrderFilters";
import WorkOrdersTable from "./WorkOrdersTable";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";

const WorkOrderList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string | "all">("all");
  
  const { workOrders, isLoading } = useWorkOrders();

  // Filter work orders based on search query and filters
  const filteredWorkOrders = workOrders?.filter(workOrder => {
    const matchesSearch = searchQuery.trim() === "" || 
      workOrder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.assignee?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.assignee?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Work Orders</CardTitle>
          <Link to="/work-orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Work Order
            </Button>
          </Link>
        </div>
        
        <WorkOrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredWorkOrders && filteredWorkOrders.length > 0 ? (
          <WorkOrdersTable workOrders={filteredWorkOrders} />
        ) : (
          <EmptyWorkOrdersState />
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderList;
