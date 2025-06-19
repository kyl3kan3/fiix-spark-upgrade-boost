
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderDescriptionProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderDescription: React.FC<WorkOrderDescriptionProps> = ({ workOrder }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          {workOrder.description}
        </p>
      </CardContent>
    </Card>
  );
};
