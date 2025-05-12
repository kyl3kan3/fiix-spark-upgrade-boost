import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Inspection } from "@/types/inspections";
import { format } from "date-fns";
import { toast } from "sonner";

// Empty object to replace mock data
const mockInspections: Record<string, Inspection> = {};

const InspectionDetailPage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | undefined>(
    inspectionId ? mockInspections[inspectionId] : undefined
  );
  const [inspectionItems, setInspectionItems] = useState(
    inspection ? [...inspection.items] : []
  );

  if (!inspection) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Inspection Not Found</h2>
          <Button onClick={() => navigate("/inspections")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleBackClick = () => {
    navigate("/inspections");
  };

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

  const handleItemPassChange = (itemId: string, passed: boolean) => {
    const newItems = inspectionItems.map(item => 
      item.id === itemId ? { ...item, passed } : item
    );
    setInspectionItems(newItems);
  };

  const handleNoteChange = (itemId: string, notes: string) => {
    const newItems = inspectionItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    );
    setInspectionItems(newItems);
  };

  const handleUpdateStatus = (newStatus: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled') => {
    setInspection({
      ...inspection,
      status: newStatus,
      completedDate: newStatus === 'completed' ? new Date().toISOString() : inspection.completedDate
    });
    
    toast.success(`Inspection status updated to ${newStatus}`);
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{inspection.title} | MaintenEase</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{inspection.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
              {inspection.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(inspection.priority)}`}>
              {inspection.priority}
            </span>
          </div>
          
          <div className="flex gap-2">
            {inspection.status !== 'completed' && (
              <Button 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleUpdateStatus('completed')}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <Button onClick={() => navigate(`/inspections/edit/${inspection.id}`)}>
              Edit Inspection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1">{inspection.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Asset</h3>
                    <p className="mt-1">{inspection.assetName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                    <p className="mt-1">{inspection.assignedTo}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Scheduled Date</h3>
                    <p className="mt-1">{format(new Date(inspection.scheduledDate), "PPpp")}</p>
                  </div>
                  
                  {inspection.completedDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Completed Date</h3>
                      <p className="mt-1">{format(new Date(inspection.completedDate), "PPpp")}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant={inspection.status === 'scheduled' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('scheduled')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Set as Scheduled
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant={inspection.status === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('in-progress')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Set as In Progress
                </Button>
                
                <Button 
                  className="w-full justify-start bg-green-600 hover:bg-green-700" 
                  variant={inspection.status === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('completed')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Complete Inspection
                </Button>
                
                <Button 
                  className="w-full justify-start bg-red-600 hover:bg-red-700" 
                  variant={inspection.status === 'failed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('failed')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Mark as Failed
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant={inspection.status === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Inspection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Item</TableHead>
                  <TableHead className="w-[100px] text-center">Pass/Fail</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Checkbox
                            id={`${item.id}-pass`}
                            checked={item.passed === true}
                            disabled={inspection.status === 'completed'}
                            onCheckedChange={() => handleItemPassChange(item.id, true)}
                          />
                          <label htmlFor={`${item.id}-pass`} className="text-sm text-green-600">Pass</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox
                            id={`${item.id}-fail`}
                            checked={item.passed === false}
                            disabled={inspection.status === 'completed'}
                            onCheckedChange={() => handleItemPassChange(item.id, false)}
                          />
                          <label htmlFor={`${item.id}-fail`} className="text-sm text-red-600">Fail</label>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.notes}
                        disabled={inspection.status === 'completed'}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        placeholder="Enter notes"
                        className="h-20 min-h-0"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {inspection.status !== 'completed' && inspectionItems.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button>Save Checklist</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InspectionDetailPage;
