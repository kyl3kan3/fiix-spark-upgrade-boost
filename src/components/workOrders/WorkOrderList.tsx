
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkOrders } from "./useWorkOrders";
import WorkOrderFilters from "./WorkOrderFilters";
import WorkOrdersTable from "./WorkOrdersTable";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";
import { useWorkOrderNavigation } from "./hooks/useWorkOrderNavigation";

const WorkOrderList: React.FC = () => {
  const { 
    workOrders, 
    isLoading, 
    filters, 
    updateFilters, 
    resetFilters 
  } = useWorkOrders();

  const { handleCreateWorkOrder } = useWorkOrderNavigation();
  
  return (
    <Card className="w-full transition-colors dark:border-gray-700">
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
          filters={filters}
          updateFilters={updateFilters}
          resetFilters={resetFilters}
        />
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : workOrders && workOrders.length > 0 ? (
          <WorkOrdersTable workOrders={workOrders} isLoading={isLoading} />
        ) : (
          <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderList;
