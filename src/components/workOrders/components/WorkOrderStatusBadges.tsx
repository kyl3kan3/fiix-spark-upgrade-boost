
import React from "react";
import { Badge } from "@/components/ui/badge";
import { statusColorMap, priorityColorMap } from "../utils/colorMaps";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderStatusBadgesProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderStatusBadges: React.FC<WorkOrderStatusBadgesProps> = ({ workOrder }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className={statusColorMap[workOrder.status] || "bg-gray-100"}>
        Status: {workOrder.status?.replace("_", " ")}
      </Badge>
      <Badge className={priorityColorMap[workOrder.priority] || "bg-gray-100"}>
        Priority: {workOrder.priority}
      </Badge>
    </div>
  );
};
