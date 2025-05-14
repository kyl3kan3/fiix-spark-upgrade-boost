
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface MaintenanceFormProps {
  onCreateSchedule: (task: {
    title: string;
    asset: string;
    dueDate: Date;
    priority: "low" | "medium" | "high";
    isRecurring: boolean;
    frequency?: {
      value: number;
      unit: "days" | "weeks" | "months" | "years";
    };
  }) => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onCreateSchedule }) => {
  // Form state
  const [taskName, setTaskName] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [frequencyValue, setFrequencyValue] = useState("1");
  const [frequencyUnit, setFrequencyUnit] = useState("months");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleCreateSchedule = () => {
    if (!taskName || !selectedAsset || !startDate) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    // Create the new task
    onCreateSchedule({
      title: taskName,
      asset: selectedAsset,
      dueDate: startDate,
      priority,
      isRecurring,
      ...(isRecurring && {
        frequency: {
          value: parseInt(frequencyValue),
          unit: frequencyUnit as "days" | "weeks" | "months" | "years"
        }
      })
    });
    
    // Reset the form
    setTaskName("");
  };

  return (
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
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
          <SelectTrigger>
            <SelectValue placeholder="Select Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch 
          id="recurring-task"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring-task">Recurring Maintenance</Label>
      </div>
      
      {isRecurring && (
        <div className="space-y-2 pt-2">
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
      )}
      
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
  );
};

export default MaintenanceForm;
