
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Wrench, Package, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { UnplannedMaintenanceItem } from "./types";

interface UnplannedMaintenanceListProps {
  items: UnplannedMaintenanceItem[];
  onUpdateStatus: (id: string, status: UnplannedMaintenanceItem['status']) => void;
}

const UnplannedMaintenanceList: React.FC<UnplannedMaintenanceListProps> = ({ 
  items, 
  onUpdateStatus 
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'awaiting_parts':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusActions = (item: UnplannedMaintenanceItem) => {
    switch (item.status) {
      case 'reported':
        return (
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(item.id, 'in_progress')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Wrench className="mr-1 h-3 w-3" />
            Start Work
          </Button>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onUpdateStatus(item.id, 'awaiting_parts')}
            >
              <Package className="mr-1 h-3 w-3" />
              Need Parts
            </Button>
            <Button 
              size="sm" 
              onClick={() => onUpdateStatus(item.id, 'completed')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Complete
            </Button>
          </div>
        );
      case 'awaiting_parts':
        return (
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(item.id, 'in_progress')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Wrench className="mr-1 h-3 w-3" />
            Resume Work
          </Button>
        );
      default:
        return null;
    }
  };

  const activeItems = items.filter(item => item.status !== 'completed');
  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Active Items */}
      <div className="space-y-3">
        {activeItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No active unplanned maintenance issues</p>
            <p className="text-sm">Great job keeping everything running smoothly!</p>
          </div>
        ) : (
          activeItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                      {item.urgency}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Asset: {item.asset}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Reported by: {item.reportedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(item.reportedAt, 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                  
                  {item.estimatedDowntime && (
                    <div className="text-sm">
                      <span className="font-medium">Estimated Downtime:</span> {item.estimatedDowntime}
                    </div>
                  )}
                  
                  {item.assignedTo && (
                    <div className="text-sm">
                      <span className="font-medium">Assigned to:</span> {item.assignedTo}
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-2">
                    {getStatusActions(item)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completed Items Section */}
      {completedItems.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Recently Completed</h3>
          <div className="space-y-2">
            {completedItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.asset}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(item.status)}>completed</Badge>
                  {item.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {format(item.completedAt, 'MMM dd, HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnplannedMaintenanceList;
