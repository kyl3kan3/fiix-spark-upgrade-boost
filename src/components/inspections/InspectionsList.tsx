
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar, FileText, User } from "lucide-react";
import { Inspection } from "@/types/inspections";
import { Skeleton } from "@/components/ui/skeleton";

interface InspectionsListProps {
  inspections: Inspection[];
  loading: boolean;
}

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

const InspectionsList: React.FC<InspectionsListProps> = ({ inspections, loading }) => {
  const navigate = useNavigate();
  
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="p-4 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
                <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
                <div className="mt-4">
                  <Skeleton className="h-4 w-1/3 dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 dark:bg-gray-700" />
                <Skeleton className="h-6 w-20 dark:bg-gray-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No inspections found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start by creating your first inspection checklist
        </p>
        <Button
          onClick={() => navigate("/inspections/new")}
          className="bg-maintenease-600 hover:bg-maintenease-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Inspection
        </Button>
      </div>
    );
  }

  // Inspection list
  return (
    <div className="space-y-4">
      {inspections.map((inspection) => (
        <Card
          key={inspection.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer dark:border-gray-700"
          onClick={() => navigate(`/inspections/${inspection.id}`)}
        >
          <div className="flex flex-col md:flex-row md:justify-between gap-2">
            <div>
              <h3 className="font-medium dark:text-gray-100">{inspection.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{inspection.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="dark:text-gray-300">{format(new Date(inspection.scheduledDate), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="dark:text-gray-300">{inspection.assetName}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="dark:text-gray-300">{inspection.assignedTo}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
              <Badge className={`font-normal ${getStatusColor(inspection.status)}`}>
                {inspection.status.replace('-', ' ')}
              </Badge>
              <Badge className={`font-normal ${getPriorityColor(inspection.priority)}`}>
                {inspection.priority}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InspectionsList;
