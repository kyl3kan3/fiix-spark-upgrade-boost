
import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkOrdersTable from "@/components/workOrders/WorkOrdersTable";
import WorkOrderFilters from "@/components/workOrders/WorkOrderFilters";
import { useWorkOrders } from "@/components/workOrders/useWorkOrders";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const WorkOrdersPage: React.FC = () => {
  const {
    workOrders,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
  } = useWorkOrders();

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        
        <Link to="/work-orders/new">
          <Button className="whitespace-nowrap bg-fiix-500 hover:bg-fiix-600">
            <Plus className="mr-2 h-4 w-4" /> 
            New Work Order
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <WorkOrderFilters 
          filters={filters}
          updateFilters={updateFilters}
          resetFilters={resetFilters}
        />
      </div>
      
      <WorkOrdersTable 
        workOrders={workOrders} 
        isLoading={isLoading}
        error={error}
      />
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
