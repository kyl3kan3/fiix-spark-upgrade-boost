
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Clock, User, Calendar, Wrench } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { format } from "date-fns";
import { WorkOrderComments } from "./components/WorkOrderComments";

interface WorkOrderDetailsProps {
  workOrder: WorkOrderWithRelations;
  onEdit: () => void;
  onDelete: () => void;
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">
                {workOrder.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(workOrder.status)}>
                  {workOrder.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(workOrder.priority)}>
                  {workOrder.priority}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            {workOrder.description}
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assigned To
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.assignee 
                    ? `${workOrder.assignee.first_name || ''} ${workOrder.assignee.last_name || ''}`.trim()
                    : "Unassigned"
                  }
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Wrench className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Asset
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.asset?.name || "No asset assigned"}
                </p>
                {workOrder.asset?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workOrder.asset.description}
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created By
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  {workOrder.creator 
                    ? `${workOrder.creator.first_name || ''} ${workOrder.creator.last_name || ''}`.trim()
                    : "Unknown"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Comments */}
      <WorkOrderComments workOrder={workOrder} />
    </div>
  );
};
