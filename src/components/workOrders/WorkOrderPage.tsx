import React from "react";
import { useWorkOrders } from "./useWorkOrders";
import { useWorkOrderNavigation } from "./hooks/useWorkOrderNavigation";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";
import JobsBuckets from "./JobsBuckets";

export const WorkOrderPage: React.FC = () => {
  const { workOrders, isLoading } = useWorkOrders();
  const { handleCreateWorkOrder } = useWorkOrderNavigation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-2xl animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (workOrders.length === 0) {
    return <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />;
  }

  return <JobsBuckets jobs={workOrders} />;
};
