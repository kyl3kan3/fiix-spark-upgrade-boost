
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check, Clock, PlusCircle, Trash2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

interface MaintenanceScheduleSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  priority: string;
  tasks: string[];
}

const defaultScheduleTemplates: ScheduleTemplate[] = [
  {
    id: "monthly-hvac-inspection",
    name: "Monthly HVAC Inspection",
    description: "Monthly inspection of all HVAC systems",
    frequency: "monthly",
    priority: "medium",
    tasks: [
      "Check and replace air filters if needed",
      "Inspect belts and pulleys for wear",
      "Clean condenser and evaporator coils",
      "Check refrigerant levels",
      "Test system operation"
    ]
  },
  {
    id: "quarterly-electrical",
    name: "Quarterly Electrical System Check",
    description: "Routine inspection of electrical systems and components",
    frequency: "quarterly",
    priority: "high",
    tasks: [
      "Inspect electrical panels",
      "Check for loose connections",
      "Test circuit breakers",
      "Measure voltage and load balance",
      "Check backup power systems"
    ]
  },
  {
    id: "annual-safety",
    name: "Annual Safety Equipment Inspection",
    description: "Yearly inspection of all safety equipment",
    frequency: "annually",
    priority: "urgent",
    tasks: [
      "Test fire alarm systems",
      "Inspect fire extinguishers",
      "Check emergency lighting",
      "Test sprinkler systems",
      "Confirm safety signage is in place"
    ]
  }
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  frequency: z.string({
    required_error: "Please select a frequency.",
  }),
  priority: z.string({
    required_error: "Please select a priority level.",
  }),
});

const MaintenanceScheduleSetup: React.FC<MaintenanceScheduleSetupProps> = ({ data, onUpdate }) => {
  const [schedules, setSchedules] = useState<ScheduleTemplate[]>(
    data?.schedules || defaultScheduleTemplates
  );
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleTemplate | null>(null);
  const [newTask, setNewTask] = useState("");
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "monthly",
      priority: "medium",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const id = values.name.toLowerCase().replace(/\s+/g, '-');
    const newSchedule: ScheduleTemplate = {
      id,
      name: values.name,
      description: values.description || "",
      frequency: values.frequency,
      priority: values.priority,
      tasks: []
    };
    
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    setSelectedSchedule(newSchedule);
    setIsAddingSchedule(false);
    form.reset();
    onUpdate({ schedules: updated });
  };

  const handleSelectSchedule = (schedule: ScheduleTemplate) => {
    setSelectedSchedule(schedule);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updated = schedules.filter(s => s.id !== scheduleId);
    setSchedules(updated);
    
    if (selectedSchedule?.id === scheduleId) {
      setSelectedSchedule(updated.length > 0 ? updated[0] : null);
    }
    
    onUpdate({ schedules: updated });
  };

  const handleAddTask = () => {
    if (!newTask.trim() || !selectedSchedule) return;
    
    const updatedSchedule = {
      ...selectedSchedule,
      tasks: [...selectedSchedule.tasks, newTask]
    };
    
    const updated = schedules.map(s => 
      s.id === selectedSchedule.id ? updatedSchedule : s
    );
    
    setSchedules(updated);
    setSelectedSchedule(updatedSchedule);
    setNewTask("");
    onUpdate({ schedules: updated });
  };

  const handleDeleteTask = (scheduleId: string, taskIndex: number) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const updatedSchedule = {
      ...schedule,
      tasks: schedule.tasks.filter((_, index) => index !== taskIndex)
    };
    
    const updated = schedules.map(s => 
      s.id === scheduleId ? updatedSchedule : s
    );
    
    setSchedules(updated);
    if (selectedSchedule?.id === scheduleId) {
      setSelectedSchedule(updatedSchedule);
    }
    onUpdate({ schedules: updated });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "high": return "bg-amber-100 text-amber-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Every day";
      case "weekly": return "Every week";
      case "monthly": return "Every month";
      case "quarterly": return "Every 3 months";
      case "biannually": return "Every 6 months";
      case "annually": return "Every year";
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Maintenance Schedule Templates</h2>
      </div>
      
      <p className="text-muted-foreground">
        Create preventive maintenance schedule templates for your different asset types.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Templates</h3>
            <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Maintenance Template</DialogTitle>
                  <DialogDescription>
                    Define a new preventive maintenance schedule template
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Monthly Equipment Check" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of this maintenance schedule" {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="biannually">Bi-annually</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter className="pt-2">
                      <Button variant="outline" type="button" onClick={() => setIsAddingSchedule(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Template</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${selectedSchedule?.id === schedule.id ? 'border-maintenease-600 bg-maintenease-50' : ''}`}
                onClick={() => handleSelectSchedule(schedule)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{schedule.name}</h4>
                  <Badge className={getPriorityColor(schedule.priority)}>
                    {schedule.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{getFrequencyLabel(schedule.frequency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedSchedule ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{selectedSchedule.name}</CardTitle>
                  <CardDescription>
                    {selectedSchedule.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">
                      {getFrequencyLabel(selectedSchedule.frequency)}
                    </Badge>
                    <Badge className={getPriorityColor(selectedSchedule.priority)}>
                      {selectedSchedule.priority} priority
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Tasks Checklist</h3>
                  
                  {selectedSchedule.tasks.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedSchedule.tasks.map((task, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between border rounded-md p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                              <Check className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span>{task}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTask(selectedSchedule.id, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                      <p>No tasks added to this template yet</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Input
                      placeholder="Add a new task to this checklist"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTask();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddTask}
                      disabled={!newTask.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center text-center p-8">
                <Calendar className="h-12 w-12 mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium">No Template Selected</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Select a template from the list or create a new one
                </p>
                <Button onClick={() => setIsAddingSchedule(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduleSetup;
