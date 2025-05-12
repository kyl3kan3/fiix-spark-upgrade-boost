
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

// Mock data for inspections
const mockInspections: Inspection[] = [
  {
    id: "insp-001",
    title: "Annual HVAC System Inspection",
    description: "Comprehensive inspection of the HVAC system",
    assetId: "asset-001",
    assetName: "Main Building HVAC",
    status: "scheduled",
    priority: "high",
    assignedTo: "John Doe",
    scheduledDate: "2025-05-25T10:00:00",
    items: [
      { id: "item-001", name: "Filter check", passed: null, notes: "" },
      { id: "item-002", name: "Duct inspection", passed: null, notes: "" },
      { id: "item-003", name: "Thermostat calibration", passed: null, notes: "" }
    ]
  },
  {
    id: "insp-002",
    title: "Quarterly Fire Alarm Test",
    description: "Routine inspection of all fire alarm systems",
    assetId: "asset-002",
    assetName: "Building Safety Systems",
    status: "completed",
    priority: "critical",
    assignedTo: "Sarah Johnson",
    scheduledDate: "2025-05-10T09:00:00",
    completedDate: "2025-05-10T11:30:00",
    items: [
      { id: "item-004", name: "Alarm trigger test", passed: true, notes: "All systems responding properly" },
      { id: "item-005", name: "Sprinkler system check", passed: true, notes: "Pressure optimal" },
      { id: "item-006", name: "Emergency lighting test", passed: true, notes: "All lights functional" }
    ]
  },
  {
    id: "insp-003",
    title: "Monthly Generator Inspection",
    description: "Regular inspection of backup power systems",
    assetId: "asset-003",
    assetName: "Backup Generator #2",
    status: "in-progress",
    priority: "medium",
    assignedTo: "Mike Smith",
    scheduledDate: "2025-05-15T13:00:00",
    items: [
      { id: "item-007", name: "Fuel level check", passed: true, notes: "Fuel at 85%" },
      { id: "item-008", name: "Battery test", passed: null, notes: "" },
      { id: "item-009", name: "Load test", passed: null, notes: "" }
    ]
  }
];

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
  const [inspections] = useState<Inspection[]>(mockInspections);

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
                <TableCell>{format(new Date(inspection.scheduledDate), "MMM d, yyyy")}</TableCell>
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
