import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, AlertCircle } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { format } from "date-fns";

interface WorkOrderBoardViewProps {
  workOrders: WorkOrderWithRelations[];
}

const WorkOrderBoardView = ({ workOrders }: WorkOrderBoardViewProps) => {
  const statusColumns = [
    { key: 'pending', label: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { key: 'completed', label: 'Completed', color: 'bg-green-50 border-green-200' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-50 border-gray-200' },
  ];

  const groupedWorkOrders = statusColumns.reduce((acc, status) => {
    acc[status.key] = workOrders.filter(wo => wo.status === status.key);
    return acc;
  }, {} as Record<string, WorkOrderWithRelations[]>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statusColumns.map((column) => (
        <div key={column.key} className="space-y-3 sm:space-y-4">
          <div className={`rounded-lg p-3 sm:p-4 ${column.color}`}>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              {column.label}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {groupedWorkOrders[column.key]?.length || 0} work orders
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
            {groupedWorkOrders[column.key]?.map((workOrder) => (
              <Card key={workOrder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm sm:text-base font-medium line-clamp-2">
                      {workOrder.title}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex-shrink-0 ${getPriorityColor(workOrder.priority)}`}
                    >
                      {workOrder.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-4 pt-0">
                  {workOrder.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {workOrder.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {workOrder.asset && (
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{workOrder.asset.name}</span>
                      </div>
                    )}
                    
                    {workOrder.assignee && (
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                          {workOrder.assignee.first_name} {workOrder.assignee.last_name}
                        </span>
                      </div>
                    )}
                    
                    {workOrder.due_date && (
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{format(new Date(workOrder.due_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {groupedWorkOrders[column.key]?.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <p className="text-xs sm:text-sm">No work orders</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkOrderBoardView;
