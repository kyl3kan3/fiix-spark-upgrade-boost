
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { format } from "date-fns";
import { getStatusColor, getPriorityColor } from "../workOrderUtils";

interface WorkOrderListViewProps {
  workOrders: WorkOrderWithRelations[];
  onView: (workOrder: WorkOrderWithRelations) => void;
  onEdit: (workOrder: WorkOrderWithRelations) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderListView: React.FC<WorkOrderListViewProps> = ({
  workOrders,
  onView,
  onEdit,
  onDelete
}) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No work orders found. Create your first work order to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">
                  {workOrder.title}
                </CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(workOrder.priority)}>
                    {workOrder.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(workOrder)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(workOrder)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(workOrder.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {workOrder.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Asset:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.asset?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Assignee:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.assignee 
                    ? `${workOrder.assignee.first_name || ''} ${workOrder.assignee.last_name || ''}`.trim()
                    : "Unassigned"
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {format(new Date(workOrder.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Due Date:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.due_date 
                    ? format(new Date(workOrder.due_date), "MMM dd, yyyy")
                    : "Not set"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
