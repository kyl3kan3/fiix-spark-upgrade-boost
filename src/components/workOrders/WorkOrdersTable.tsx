
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "@/components/workOrders/workOrderUtils";
import { statusColorMap, priorityColorMap } from "@/components/workOrders/workOrderUtils";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";

interface WorkOrdersTableProps {
  workOrders: WorkOrderWithRelations[];
  isLoading?: boolean;
  error?: Error | null;
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ workOrders, isLoading, error }) => {
  const navigate = useNavigate();

  const handleCreateWorkOrder = () => {
    navigate("/work-orders/new");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30">
        <p className="text-red-500 dark:text-red-400">Error loading work orders: {error.message}</p>
      </div>
    );
  }

  if (!workOrders || workOrders.length === 0) {
    return <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/30">
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700">
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <TableRow key={workOrder.id} className="dark:border-gray-700">
              <TableCell className="font-medium">
                <Link to={`/work-orders/${workOrder.id}`} className="hover:underline">
                  {workOrder.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge className={statusColorMap[workOrder.status] || "bg-gray-100"}>
                  {workOrder.status?.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColorMap[workOrder.priority] || "bg-gray-100"}>
                  {workOrder.priority}
                </Badge>
              </TableCell>
              <TableCell>{workOrder.asset?.name || "—"}</TableCell>
              <TableCell>
                {workOrder.assignee ? 
                  `${workOrder.assignee.first_name || ''} ${workOrder.assignee.last_name || ''}`.trim() : 
                  "Unassigned"}
              </TableCell>
              <TableCell>
                {workOrder.due_date ? formatDate(workOrder.due_date) : "—"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild className="dark:border-gray-600 dark:hover:bg-gray-700">
                  <Link to={`/work-orders/${workOrder.id}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTable;
