
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Thermometer, Gauge, Droplets, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DailyLogEntry {
  id: string;
  date: Date;
  technician: string;
  shiftStart: string;
  shiftEnd: string;
  equipmentReadings: EquipmentReading[];
  tasks: DailyTask[];
  incidents: Incident[];
  notes: string;
  weatherConditions: string;
}

interface EquipmentReading {
  id: string;
  equipment: string;
  type: "temperature" | "pressure" | "fluid_level" | "status";
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
}

interface DailyTask {
  id: string;
  description: string;
  completed: boolean;
  assetId?: string;
}

interface Incident {
  id: string;
  description: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

interface DailyLogProps {
  selectedDate: Date;
}

const DailyLog: React.FC<DailyLogProps> = ({ selectedDate }) => {
  const [logEntry, setLogEntry] = useState<DailyLogEntry>({
    id: "",
    date: selectedDate,
    technician: "",
    shiftStart: "",
    shiftEnd: "",
    equipmentReadings: [],
    tasks: [],
    incidents: [],
    notes: "",
    weatherConditions: ""
  });

  const [newReading, setNewReading] = useState({
    equipment: "",
    type: "temperature" as const,
    value: "",
    unit: "",
    status: "normal" as const
  });

  const [newTask, setNewTask] = useState("");
  const [newIncident, setNewIncident] = useState({
    description: "",
    severity: "medium" as const
  });

  const addEquipmentReading = () => {
    if (!newReading.equipment || !newReading.value) return;
    
    const reading: EquipmentReading = {
      id: Date.now().toString(),
      ...newReading
    };
    
    setLogEntry(prev => ({
      ...prev,
      equipmentReadings: [...prev.equipmentReadings, reading]
    }));
    
    setNewReading({
      equipment: "",
      type: "temperature",
      value: "",
      unit: "",
      status: "normal"
    });
    
    toast.success("Equipment reading added");
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: DailyTask = {
      id: Date.now().toString(),
      description: newTask,
      completed: false
    };
    
    setLogEntry(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
    
    setNewTask("");
    toast.success("Task added");
  };

  const addIncident = () => {
    if (!newIncident.description.trim()) return;
    
    const incident: Incident = {
      id: Date.now().toString(),
      description: newIncident.description,
      severity: newIncident.severity,
      resolved: false
    };
    
    setLogEntry(prev => ({
      ...prev,
      incidents: [...prev.incidents, incident]
    }));
    
    setNewIncident({
      description: "",
      severity: "medium"
    });
    
    toast.success("Incident logged");
  };

  const toggleTaskComplete = (taskId: string) => {
    setLogEntry(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const saveLogEntry = () => {
    // In a real app, this would save to the database
    toast.success("Daily log saved successfully");
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="h-4 w-4" />;
      case "pressure": return <Gauge className="h-4 w-4" />;
      case "fluid_level": return <Droplets className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Log - {format(selectedDate, "MMMM d, yyyy")}</span>
          <Button onClick={saveLogEntry} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Log
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Shift Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="technician">Technician on Duty</Label>
            <Input
              id="technician"
              value={logEntry.technician}
              onChange={(e) => setLogEntry(prev => ({ ...prev, technician: e.target.value }))}
              placeholder="Enter technician name"
            />
          </div>
          <div>
            <Label htmlFor="shiftStart">Shift Start</Label>
            <Input
              id="shiftStart"
              type="time"
              value={logEntry.shiftStart}
              onChange={(e) => setLogEntry(prev => ({ ...prev, shiftStart: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="shiftEnd">Shift End</Label>
            <Input
              id="shiftEnd"
              type="time"
              value={logEntry.shiftEnd}
              onChange={(e) => setLogEntry(prev => ({ ...prev, shiftEnd: e.target.value }))}
            />
          </div>
        </div>

        <Separator />

        {/* Equipment Readings */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Equipment Readings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <Input
              placeholder="Equipment name"
              value={newReading.equipment}
              onChange={(e) => setNewReading(prev => ({ ...prev, equipment: e.target.value }))}
            />
            <select
              className="border rounded-md px-3 py-2"
              value={newReading.type}
              onChange={(e) => setNewReading(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="temperature">Temperature</option>
              <option value="pressure">Pressure</option>
              <option value="fluid_level">Fluid Level</option>
              <option value="status">Status</option>
            </select>
            <Input
              placeholder="Value"
              value={newReading.value}
              onChange={(e) => setNewReading(prev => ({ ...prev, value: e.target.value }))}
            />
            <Input
              placeholder="Unit"
              value={newReading.unit}
              onChange={(e) => setNewReading(prev => ({ ...prev, unit: e.target.value }))}
            />
            <Button onClick={addEquipmentReading} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {logEntry.equipmentReadings.map(reading => (
              <div key={reading.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  {getStatusIcon(reading.type)}
                  <span className="font-medium">{reading.equipment}</span>
                  <span>{reading.value} {reading.unit}</span>
                </div>
                <Badge className={getStatusColor(reading.status)}>
                  {reading.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Daily Tasks */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Daily Tasks</h3>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-2">
            {logEntry.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskComplete(task.id)}
                  className="h-4 w-4"
                />
                <span className={task.completed ? "line-through text-gray-500" : ""}>
                  {task.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Incidents */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Incidents & Issues</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <Input
              placeholder="Incident description"
              value={newIncident.description}
              onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
              className="md:col-span-2"
            />
            <select
              className="border rounded-md px-3 py-2"
              value={newIncident.severity}
              onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as any }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={addIncident} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Log Incident
            </Button>
          </div>

          <div className="space-y-2">
            {logEntry.incidents.map(incident => (
              <div key={incident.id} className="flex items-center justify-between p-3 border rounded-md">
                <span>{incident.description}</span>
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Weather & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weather">Weather Conditions</Label>
            <Input
              id="weather"
              value={logEntry.weatherConditions}
              onChange={(e) => setLogEntry(prev => ({ ...prev, weatherConditions: e.target.value }))}
              placeholder="e.g., Clear, 75°F, Light wind"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">General Notes & Observations</Label>
          <Textarea
            id="notes"
            value={logEntry.notes}
            onChange={(e) => setLogEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional observations, recommendations, or notes..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyLog;
