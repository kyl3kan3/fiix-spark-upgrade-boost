
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { InspectionPriority, InspectionStatus } from "@/types/inspections";

const NewInspectionForm = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the inspection to a database
    toast.success("New inspection created successfully");
    navigate("/inspections");
  };
  
  return (
    <Card className="p-6 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="dark:text-gray-300">Inspection Title</Label>
            <Input id="title" placeholder="Enter inspection title" className="mt-1 dark:border-gray-700 dark:bg-gray-800" />
          </div>
          
          <div>
            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
            <Textarea id="description" placeholder="Provide details about this inspection" className="mt-1 dark:border-gray-700 dark:bg-gray-800" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asset" className="dark:text-gray-300">Asset</Label>
              <Select>
                <SelectTrigger id="asset" className="mt-1 dark:border-gray-700 dark:bg-gray-800">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent className="dark:border-gray-700 dark:bg-gray-800">
                  <SelectItem value="asset-001">Main Building HVAC</SelectItem>
                  <SelectItem value="asset-002">Building Safety Systems</SelectItem>
                  <SelectItem value="asset-003">Backup Generator #2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignedTo" className="dark:text-gray-300">Assign To</Label>
              <Select>
                <SelectTrigger id="assignedTo" className="mt-1 dark:border-gray-700 dark:bg-gray-800">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent className="dark:border-gray-700 dark:bg-gray-800">
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
              <Select>
                <SelectTrigger id="status" className="mt-1 dark:border-gray-700 dark:bg-gray-800">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="dark:border-gray-700 dark:bg-gray-800">
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
              <Select>
                <SelectTrigger id="priority" className="mt-1 dark:border-gray-700 dark:bg-gray-800">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="dark:border-gray-700 dark:bg-gray-800">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="scheduledDate" className="dark:text-gray-300">Scheduled Date</Label>
            <Input id="scheduledDate" type="datetime-local" className="mt-1 dark:border-gray-700 dark:bg-gray-800" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={() => navigate("/inspections")} className="dark:border-gray-700 dark:hover:bg-gray-800">
            Cancel
          </Button>
          <Button type="submit">Create Inspection</Button>
        </div>
      </form>
    </Card>
  );
};

export default NewInspectionForm;
