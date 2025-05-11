
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, User } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";

interface WorkOrderDetailsCardProps {
  workOrder: WorkOrderWithRelations;
}

export const WorkOrderDetailsCard: React.FC<WorkOrderDetailsCardProps> = ({ workOrder }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium">Due Date</h3>
            </div>
            <p className="text-gray-700">
              {workOrder.due_date ? formatDate(workOrder.due_date) : "No due date set"}
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Package className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium">Related Asset</h3>
            </div>
            {workOrder.asset ? (
              <div>
                <p className="font-medium">{workOrder.asset.name}</p>
                {workOrder.asset.location && (
                  <p className="text-gray-500 text-sm">Location: {workOrder.asset.location}</p>
                )}
                {workOrder.asset.serial_number && (
                  <p className="text-gray-500 text-sm">S/N: {workOrder.asset.serial_number}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No asset associated</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium">Assigned To</h3>
            </div>
            {workOrder.assignee ? (
              <p className="text-gray-700">
                {workOrder.assignee.first_name} {workOrder.assignee.last_name}
              </p>
            ) : (
              <p className="text-gray-500">Unassigned</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium">Created By</h3>
            </div>
            {workOrder.creator ? (
              <p className="text-gray-700">
                {workOrder.creator.first_name} {workOrder.creator.last_name}
              </p>
            ) : (
              <p className="text-gray-500">Unknown</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
