
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { InspectionStatus, InspectionPriority } from "@/types/inspections";

interface InspectionHeaderProps {
  id: string;
  title: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  handleBackClick: () => void;
  handleUpdateStatus: (status: InspectionStatus) => void;
}

const InspectionHeader: React.FC<InspectionHeaderProps> = ({
  id,
  title,
  status,
  priority,
  handleBackClick,
  handleUpdateStatus,
}) => {
  const navigate = useNavigate();
  
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
        <Badge className={`${getStatusColor(status)}`}>
          {status.replace('-', ' ')}
        </Badge>
        <Badge className={`${getPriorityColor(priority)}`}>
          {priority}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        {status !== 'completed' && (
          <Button 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => handleUpdateStatus('completed')}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        )}
        <Button onClick={() => navigate(`/inspections/edit/${id}`)}>
          Edit Inspection
        </Button>
      </div>
    </div>
  );
};

export default InspectionHeader;
