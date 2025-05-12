import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inspection } from "@/types/inspections";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Empty array to be replaced with data from the database
const inspections: Inspection[] = [];

interface InspectionsListProps {
  filters: {
    status: string;
    priority: string;
    assignedTo: string;
    dateRange: { from: Date | undefined; to: Date | undefined };
  };
}

export const InspectionsList: React.FC<InspectionsListProps> = ({ filters }) => {
  const navigate = useNavigate();
  const [inspections] = useState<Inspection[]>(inspections);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInspectionClick = (id: string) => {
    navigate(`/inspections/${id}`);
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.length > 0 ? (
            inspections.map((inspection) => (
              <TableRow 
                key={inspection.id}
                onClick={() => handleInspectionClick(inspection.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{inspection.title}</TableCell>
                <TableCell>{inspection.assetName}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(inspection.priority)}`}>
                    {inspection.priority}
                  </span>
                </TableCell>
                <TableCell>{inspection.assignedTo}</TableCell>
                <TableCell>{inspection.scheduledDate ? format(new Date(inspection.scheduledDate), "MMM d, yyyy") : ""}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspectionClick(inspection.id);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No inspections found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
