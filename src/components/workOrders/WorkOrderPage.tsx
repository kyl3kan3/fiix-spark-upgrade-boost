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
 <div className="space-y-6">
 <div className="flex gap-3">
 <div className="h-11 w-64 bg-muted rounded-lg animate-pulse" />
 <div className="h-11 w-24 bg-muted rounded-full animate-pulse" />
 <div className="h-11 w-28 bg-muted rounded-full animate-pulse" />
 </div>
 <div className="h-14 bg-muted rounded-xl animate-pulse" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
 ))}
 </div>
 </div>
 );
 }

 if (workOrders.length === 0) {
 return <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />;
 }

 return <JobsBuckets jobs={workOrders} />;
};
