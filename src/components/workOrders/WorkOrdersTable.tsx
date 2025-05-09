
import React from "react";
import { Link } from "react-router-dom";
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
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "@/components/workOrders/workOrderUtils";
import { statusColorMap, priorityColorMap } from "@/components/workOrders/workOrderUtils";

interface WorkOrdersTableProps {
  workOrders: WorkOrderWithRelations[];
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ workOrders }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
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
            <TableRow key={workOrder.id}>
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
                <Button variant="outline" size="sm" asChild>
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
