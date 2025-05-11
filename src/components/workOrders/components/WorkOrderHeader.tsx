
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, FileSpreadsheet } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";
import { exportWorkOrderToPdf, exportWorkOrderToCsv } from "../utils/exportUtils";

interface WorkOrderHeaderProps {
  workOrder: WorkOrderWithRelations;
  onDelete: () => void;
}

export const WorkOrderHeader: React.FC<WorkOrderHeaderProps> = ({ 
  workOrder, 
  onDelete 
}) => {
  const handleExportPdf = () => {
    exportWorkOrderToPdf(workOrder);
  };

  const handleExportCsv = () => {
    exportWorkOrderToCsv(workOrder);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <span>Work Order #{workOrder.id.split('-')[0]}</span>
          <span>•</span>
          <span>Created {formatDate(workOrder.created_at)}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link to="/work-orders">
            Back
          </Link>
        </Button>
        <Button variant="outline" onClick={handleExportPdf}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" onClick={handleExportCsv}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/work-orders/${workOrder.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};
