
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTask } from "./preventive-maintenance/types";
import MaintenanceForm from "./preventive-maintenance/MaintenanceForm";
import MaintenanceCalendar from "./preventive-maintenance/MaintenanceCalendar";
import TasksHeader from "./preventive-maintenance/TasksHeader";
import MaintenanceTaskList from "./preventive-maintenance/MaintenanceTaskList";
import { toast } from "sonner";
import { add } from "date-fns";

const PreventiveMaintenanceContent: React.FC = () => {
 const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
 
 // Empty maintenance tasks - will be populated from database
 const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
 
 // Current month's tasks for calendar highlights
 const currentMonthTaskDays = maintenanceTasks.map(task => task.dueDate.getDate());
 
 const handleCreateSchedule = (taskData: Omit<MaintenanceTask, "id" | "lastCompleted">) => {
 // Generate a new ID
 const newId = Math.max(0, ...maintenanceTasks.map(t => t.id)) + 1;
 
 // Create the new task
 const newTask: MaintenanceTask = {
 id: newId,
 ...taskData,
 lastCompleted: undefined
 };
 
 // Add it to our list and show success message
 setMaintenanceTasks([...maintenanceTasks, newTask]);
 
 // If it's recurring, also generate the next occurrences
 if (taskData.isRecurring && taskData.frequency) {
 const secondOccurrence = generateNextOccurrence(newTask);
 if (secondOccurrence) {
 setMaintenanceTasks(prev => [...prev, secondOccurrence]);
 }
 }
 
 toast.success(
 taskData.isRecurring 
 ? "Recurring maintenance schedule created" 
 : "Maintenance schedule created successfully"
 );
 };

 const generateNextOccurrence = (task: MaintenanceTask): MaintenanceTask | null => {
 if (!task.isRecurring || !task.frequency) return null;
 
 const { value, unit } = task.frequency;
 
 // Calculate next due date based on frequency
 const nextDueDate = add(task.dueDate, {
 [unit]: value
 });
 
 // Return a new task with updated due date and ID
 return {
 ...task,
 id: Math.max(0, ...maintenanceTasks.map(t => t.id)) + 2, // Ensure unique ID
 dueDate: nextDueDate
 };
 };

 const handleCompleteTask = (taskId: number) => {
 // Find the task
 const task = maintenanceTasks.find(t => t.id === taskId);
 if (!task) return;
 
 // Remove the completed task
 setMaintenanceTasks(prev => prev.filter(t => t.id !== taskId));
 
 // If it's recurring, generate the next occurrence
 if (task.isRecurring && task.frequency) {
 const now = new Date();
 const nextTask = {
 ...task,
 id: Math.max(0, ...maintenanceTasks.map(t => t.id)) + 1,
 dueDate: add(now, {
 [task.frequency.unit]: task.frequency.value
 }),
 lastCompleted: now
 };
 
 setMaintenanceTasks(prev => [...prev, nextTask]);
 toast.success(`Task completed. Next occurrence scheduled for ${nextTask.dueDate.toLocaleDateString()}`);
 } else {
 toast.success("Task marked as completed");
 }
 };

 const handleClearDateSelection = () => {
 setSelectedDate(undefined);
 };

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Calendar View */}
 <div className="lg:col-span-8">
 <Card className="bg-card border border-border rounded-lg shadow-sm">
 <CardHeader className="border-b border-border pb-4">
 <CardTitle className="font-headline text-xl text-foreground">Maintenance Calendar</CardTitle>
 </CardHeader>
 <CardContent className="pt-5">
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
 </div>

 {/* Create Schedule Form */}
 <div className="lg:col-span-4">
 <Card className="bg-card border border-border rounded-lg shadow-sm">
 <CardHeader className="border-b border-border pb-4">
 <CardTitle className="font-headline text-xl text-foreground">Create PM Schedule</CardTitle>
 </CardHeader>
 <CardContent className="pt-5">
 <MaintenanceForm onCreateSchedule={handleCreateSchedule} />
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
};

export default PreventiveMaintenanceContent;
