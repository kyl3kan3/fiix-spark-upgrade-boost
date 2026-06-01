import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon, AlertCircle, Eye, Edit, Trash2 } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { format } from "date-fns";
import { getPriorityColor } from "./workOrderUtils";

interface WorkOrderBoardViewProps {
 workOrders: WorkOrderWithRelations[];
 onView: (workOrder: WorkOrderWithRelations) => void;
 onEdit: (workOrder: WorkOrderWithRelations) => void;
 onDelete: (workOrderId: string) => void;
}

const WorkOrderBoardView: React.FC<WorkOrderBoardViewProps> = ({ 
 workOrders,
 onView,
 onEdit,
 onDelete
}) => {
 const statusColumns = [
 { key: 'pending', label: 'Pending', color: 'bg-warning/10 border-warning/30' },
 { key: 'in_progress', label: 'In Progress', color: 'bg-primary/10 border-primary/30' },
 { key: 'completed', label: 'Completed', color: 'bg-success/10 border-success/30' },
 { key: 'cancelled', label: 'Cancelled', color: 'bg-muted border-border' },
 ];

 const groupedWorkOrders = statusColumns.reduce((acc, status) => {
 acc[status.key] = workOrders.filter(wo => wo.status === status.key);
 return acc;
 }, {} as Record<string, WorkOrderWithRelations[]>);

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {statusColumns.map((column) => (
 <div key={column.key} className="space-y-3 sm:space-y-4">
 <div className={`rounded-lg p-3 sm:p-4 ${column.color}`}>
 <h3 className="font-semibold text-sm sm:text-base text-foreground">
 {column.label}
 </h3>
 <p className="text-xs sm:text-sm text-foreground mt-1">
 {groupedWorkOrders[column.key]?.length || 0} work orders
 </p>
 </div>
 
 <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
 {groupedWorkOrders[column.key]?.map((workOrder) => (
 <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
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
 <p className="text-xs sm:text-sm text-foreground mb-3 line-clamp-2">
 {workOrder.description}
 </p>
 )}
 
 <div className="space-y-2 mb-3">
 {workOrder.asset && (
 <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
 <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
 <span className="truncate">{workOrder.asset.name}</span>
 </div>
 )}
 
 {workOrder.assignee && (
 <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
 <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
 <span className="truncate">
 {workOrder.assignee.first_name} {workOrder.assignee.last_name}
 </span>
 </div>
 )}
 
 {workOrder.due_date && (
 <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
 <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
 <span>{format(new Date(workOrder.due_date), 'MMM dd, yyyy')}</span>
 </div>
 )}
 </div>

 <div className="flex items-center gap-1 pt-2 border-t">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onView(workOrder)}
 className="h-8 px-2"
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEdit(workOrder)}
 className="h-8 px-2"
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onDelete(workOrder.id)}
 className="h-8 px-2 text-destructive hover:text-destructive"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 
 {groupedWorkOrders[column.key]?.length === 0 && (
 <div className="text-center py-6 sm:py-8 text-muted-foreground">
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
