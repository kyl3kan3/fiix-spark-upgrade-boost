
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface InspectionDetailsCardProps {
  description: string;
  assetName: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
}

const InspectionDetailsCard: React.FC<InspectionDetailsCardProps> = ({
  description,
  assetName,
  assignedTo,
  scheduledDate,
  completedDate,
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Inspection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Asset</h3>
              <p className="mt-1">{assetName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
              <p className="mt-1">{assignedTo}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Scheduled Date</h3>
              <p className="mt-1">{format(new Date(scheduledDate), "PPpp")}</p>
            </div>
            
            {completedDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed Date</h3>
                <p className="mt-1">{format(new Date(completedDate), "PPpp")}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InspectionDetailsCard;
