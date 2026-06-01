
import React from "react";
import { getStatusColor, getPriorityColor } from "../workOrderUtils";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderStatusBadgesProps {
 workOrder: WorkOrderWithRelations;
}

export const WorkOrderStatusBadges: React.FC<WorkOrderStatusBadgesProps> = ({ workOrder }) => {
 return (
 <div className="flex flex-wrap gap-2 items-center">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(workOrder.status)}`}>
 <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
 {workOrder.status?.replace("_", " ")}
 </span>
 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityColor(workOrder.priority)}`}>
 {workOrder.priority} priority
 </span>
 </div>
 );
};
