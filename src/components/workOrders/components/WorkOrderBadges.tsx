
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { getStatusColor, getPriorityColor } from "../workOrderUtils";

interface WorkOrderBadgesProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderBadges: React.FC<WorkOrderBadgesProps> = ({ workOrder }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Badge className={getStatusColor(workOrder.status)}>
        {workOrder.status.replace('_', ' ')}
      </Badge>
      <Badge className={getPriorityColor(workOrder.priority)}>
        {workOrder.priority}
      </Badge>
    </div>
  );
};
