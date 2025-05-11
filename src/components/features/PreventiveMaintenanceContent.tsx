
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface MaintenanceTask {
  id: number;
  title: string;
  asset: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
}

const PreventiveMaintenanceContent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form state
  const [taskName, setTaskName] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [frequencyValue, setFrequencyValue] = useState("1");
  const [frequencyUnit, setFrequencyUnit] = useState("months");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  
  // Sample maintenance tasks
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    { id: 1, title: "HVAC Filter Change", asset: "Building A", dueDate: new Date(2025, 4, 15), priority: "medium" },
    { id: 2, title: "Machine Lubrication", asset: "Production Line 2", dueDate: new Date(2025, 4, 22), priority: "high" },
    { id: 3, title: "Safety Inspection", asset: "Warehouse", dueDate: new Date(2025, 4, 27), priority: "medium" },
    { id: 4, title: "Electrical System Check", asset: "Main Office", dueDate: new Date(2025, 5, 5), priority: "low" },
    { id: 5, title: "Conveyor Belt Inspection", asset: "Assembly Line", dueDate: new Date(2025, 5, 12), priority: "high" }
  ]);
  
  // Current month's tasks for calendar highlights
  const currentMonthTaskDays = maintenanceTasks.map(task => task.dueDate.getDate());
  
  // Display only tasks for selected date or all if no date selected
  const filteredTasks = selectedDate 
    ? maintenanceTasks.filter(task => 
        task.dueDate.getDate() === selectedDate.getDate() && 
        task.dueDate.getMonth() === selectedDate.getMonth() && 
        task.dueDate.getFullYear() === selectedDate.getFullYear())
    : maintenanceTasks;
    
  const handleCreateSchedule = () => {
    if (!taskName || !selectedAsset || !startDate) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    // Generate a new ID
    const newId = Math.max(0, ...maintenanceTasks.map(t => t.id)) + 1;
    
    // Create the new task
    const newTask: MaintenanceTask = {
      id: newId,
      title: taskName,
      asset: selectedAsset,
      dueDate: startDate,
      priority: "medium"
    };
    
    // Add it to our list and show success message
    setMaintenanceTasks([...maintenanceTasks, newTask]);
    
    // Reset the form
    setTaskName("");
    
    toast.success("Maintenance schedule created successfully");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Maintenance Calendar</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
                {selectedDate ? "Show All Tasks" : "All Tasks Showing"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border pointer-events-auto")}
                modifiers={{
                  hasTask: (date) => 
                    currentMonthTaskDays.includes(date.getDate()) && 
                    date.getMonth() === new Date().getMonth()
                }}
                modifiersStyles={{
                  hasTask: { backgroundColor: "#e5deff", fontWeight: "bold" }
                }}
              />
            </div>
            
            <h3 className="font-medium mb-3">
              {selectedDate 
                ? `Tasks for ${format(selectedDate, "MMMM d, yyyy")}` 
                : "All Upcoming Tasks"}
            </h3>
            
            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3 bg-white rounded border flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">Asset: {task.asset}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-fiix-600">
                        {format(task.dueDate, "MMM d")}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full 
                        ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No maintenance tasks found for this date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Create Schedule Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create PM Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input 
                  id="task-name" 
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  placeholder="e.g., Oil Change" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production Line 1">Production Line 1</SelectItem>
                    <SelectItem value="Production Line 2">Production Line 2</SelectItem>
                    <SelectItem value="Warehouse Equipment">Warehouse Equipment</SelectItem>
                    <SelectItem value="Building A">Building A</SelectItem>
                    <SelectItem value="Main Office">Main Office</SelectItem>
                    <SelectItem value="Assembly Line">Assembly Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowDatePicker(false);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Frequency</Label>
                <div className="flex space-x-2">
                  <Input 
                    type="number" 
                    min="1" 
                    className="w-20" 
                    value={frequencyValue}
                    onChange={e => setFrequencyValue(e.target.value)}
                  />
                  <Select value={frequencyUnit} onValueChange={setFrequencyUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="w-full bg-fiix-500 hover:bg-fiix-600"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateSchedule();
                }}
              >
                Create Schedule
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreventiveMaintenanceContent;
