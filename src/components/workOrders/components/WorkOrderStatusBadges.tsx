
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getPriorityColor } from "../workOrderUtils";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderStatusBadgesProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderStatusBadges: React.FC<WorkOrderStatusBadgesProps> = ({ workOrder }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className={getStatusColor(workOrder.status)}>
        Status: {workOrder.status?.replace("_", " ")}
      </Badge>
      <Badge className={getPriorityColor(workOrder.priority)}>
        Priority: {workOrder.priority}
      </Badge>
    </div>
  );
};
