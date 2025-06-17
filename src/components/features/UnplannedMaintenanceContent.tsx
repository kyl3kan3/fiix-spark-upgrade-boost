
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnplannedMaintenanceItem } from "./unplanned-maintenance/types";
import UnplannedMaintenanceForm from "./unplanned-maintenance/UnplannedMaintenanceForm";
import UnplannedMaintenanceList from "./unplanned-maintenance/UnplannedMaintenanceList";
import UnplannedMaintenanceDashboard from "./unplanned-maintenance/UnplannedMaintenanceDashboard";
import { toast } from "sonner";

const UnplannedMaintenanceContent: React.FC = () => {
  // Mock data - in real app this would come from database
  const [unplannedItems, setUnplannedItems] = useState<UnplannedMaintenanceItem[]>([
    {
      id: "1",
      title: "Pump Motor Failure",
      description: "Main circulation pump motor has stopped working completely",
      asset: "Pump Station A",
      assetId: "pump-001",
      reportedBy: "John Smith",
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      urgency: "critical",
      status: "in_progress",
      estimatedDowntime: "4-6 hours",
      assignedTo: "Mike Johnson"
    },
    {
      id: "2",
      title: "Conveyor Belt Misalignment",
      description: "Belt is running off track causing production delays",
      asset: "Conveyor Line 3",
      assetId: "conv-003",
      reportedBy: "Sarah Davis",
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      urgency: "high",
      status: "awaiting_parts",
      estimatedDowntime: "2-3 hours",
      assignedTo: "Tom Wilson"
    }
  ]);

  const handleCreateUnplannedMaintenance = (formData: any) => {
    const newItem: UnplannedMaintenanceItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      asset: formData.asset,
      reportedBy: "Current User", // In real app, get from auth context
      reportedAt: new Date(),
      urgency: formData.urgency,
      status: "reported",
      estimatedDowntime: formData.estimatedDowntime,
      notes: formData.notes
    };

    setUnplannedItems(prev => [newItem, ...prev]);
    toast.success("Unplanned maintenance request created successfully!");
  };

  const handleUpdateStatus = (id: string, newStatus: UnplannedMaintenanceItem['status']) => {
    setUnplannedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined }
          : item
      )
    );
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <UnplannedMaintenanceDashboard items={unplannedItems} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unplanned Maintenance List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Unplanned Maintenance</span>
              <span className="text-sm font-normal text-muted-foreground">
                {unplannedItems.filter(item => item.status !== 'completed').length} active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnplannedMaintenanceList 
              items={unplannedItems}
              onUpdateStatus={handleUpdateStatus}
            />
          </CardContent>
        </Card>
        
        {/* Quick Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Report Unplanned Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <UnplannedMaintenanceForm onSubmit={handleCreateUnplannedMaintenance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnplannedMaintenanceContent;
