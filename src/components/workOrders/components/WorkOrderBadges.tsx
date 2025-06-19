
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderBadgesProps {
  workOrder: WorkOrderWithRelations;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    case "medium":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

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
