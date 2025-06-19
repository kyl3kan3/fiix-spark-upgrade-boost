
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { WorkOrderComments } from "./components/WorkOrderComments";
import { WorkOrderDetailsHeader } from "./components/WorkOrderDetailsHeader";
import { WorkOrderBadges } from "./components/WorkOrderBadges";
import { WorkOrderDescription } from "./components/WorkOrderDescription";
import { WorkOrderInfoCard } from "./components/WorkOrderInfoCard";
import { WorkOrderTimelineCard } from "./components/WorkOrderTimelineCard";

interface WorkOrderDetailsProps {
  workOrder: WorkOrderWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

export const WorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({
  workOrder,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <WorkOrderDetailsHeader 
            workOrder={workOrder}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <WorkOrderBadges workOrder={workOrder} />
        </CardHeader>
        <CardContent>
          <WorkOrderDescription workOrder={workOrder} />
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkOrderInfoCard workOrder={workOrder} />
        <WorkOrderTimelineCard workOrder={workOrder} />
      </div>

      {/* Comments */}
      <WorkOrderComments workOrder={workOrder} />
    </div>
  );
};
