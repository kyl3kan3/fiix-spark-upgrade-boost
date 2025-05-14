
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTask } from "./preventive-maintenance/types";
import MaintenanceForm from "./preventive-maintenance/MaintenanceForm";
import MaintenanceCalendar from "./preventive-maintenance/MaintenanceCalendar";
import TasksHeader from "./preventive-maintenance/TasksHeader";
import MaintenanceTaskList from "./preventive-maintenance/MaintenanceTaskList";
import { toast } from "sonner";

const PreventiveMaintenanceContent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Empty maintenance tasks - will be populated from database
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  
  // Current month's tasks for calendar highlights
  const currentMonthTaskDays = maintenanceTasks.map(task => task.dueDate.getDate());
  
  const handleCreateSchedule = (taskData: Omit<MaintenanceTask, "id">) => {
    // Generate a new ID
    const newId = Math.max(0, ...maintenanceTasks.map(t => t.id)) + 1;
    
    // Create the new task
    const newTask: MaintenanceTask = {
      id: newId,
      ...taskData
    };
    
    // Add it to our list and show success message
    setMaintenanceTasks([...maintenanceTasks, newTask]);
    
    toast.success("Maintenance schedule created successfully");
  };

  const handleClearDateSelection = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Maintenance Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceCalendar 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              currentMonthTaskDays={currentMonthTaskDays}
            />
            
            <TasksHeader 
              selectedDate={selectedDate}
              onClearSelection={handleClearDateSelection}
            />
            
            <MaintenanceTaskList 
              tasks={maintenanceTasks}
              selectedDate={selectedDate}
            />
          </CardContent>
        </Card>
        
        {/* Create Schedule Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create PM Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceForm onCreateSchedule={handleCreateSchedule} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreventiveMaintenanceContent;
