
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderTimelineCardProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderTimelineCard: React.FC<WorkOrderTimelineCardProps> = ({ workOrder }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              {format(new Date(workOrder.created_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Updated
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              {format(new Date(workOrder.updated_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Due Date
            </p>
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
  );
};
