
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, X } from "lucide-react";
import { InspectionStatus } from "@/types/inspections";

interface InspectionActionsCardProps {
  status: InspectionStatus;
  handleUpdateStatus: (status: InspectionStatus) => void;
}

const InspectionActionsCard: React.FC<InspectionActionsCardProps> = ({
  status,
  handleUpdateStatus,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button 
            className="w-full justify-start" 
            variant={status === 'scheduled' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('scheduled')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Set as Scheduled
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant={status === 'in-progress' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('in-progress')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Set as In Progress
          </Button>
          
          <Button 
            className="w-full justify-start bg-green-600 hover:bg-green-700" 
            variant={status === 'completed' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('completed')}
          >
            <Check className="h-4 w-4 mr-2" />
            Complete Inspection
          </Button>
          
          <Button 
            className="w-full justify-start bg-red-600 hover:bg-red-700" 
            variant={status === 'failed' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('failed')}
          >
            <X className="h-4 w-4 mr-2" />
            Mark as Failed
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant={status === 'cancelled' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('cancelled')}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Inspection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InspectionActionsCard;
