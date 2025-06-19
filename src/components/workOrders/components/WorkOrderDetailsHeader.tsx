
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrderWithRelations;
  onEdit: () => void;
  onDelete: () => void;
}

export const WorkOrderDetailsHeader: React.FC<WorkOrderDetailsHeaderProps> = ({
  workOrder,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">
          {workOrder.title}
        </h1>
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
  );
};
