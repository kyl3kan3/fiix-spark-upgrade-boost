
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { UnplannedMaintenanceFormData } from "./types";

interface UnplannedMaintenanceFormProps {
  onSubmit: (data: UnplannedMaintenanceFormData) => void;
}

const UnplannedMaintenanceForm: React.FC<UnplannedMaintenanceFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UnplannedMaintenanceFormData>({
    title: "",
    description: "",
    asset: "",
    urgency: "medium",
    estimatedDowntime: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.asset) {
      return;
    }
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      asset: "",
      urgency: "medium",
      estimatedDowntime: "",
      notes: ""
    });
  };

  const urgencyOptions = [
    { value: "critical", label: "Critical", color: "text-red-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "low", label: "Low", color: "text-green-600" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Issue Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <Label htmlFor="asset">Affected Asset</Label>
        <Select 
          value={formData.asset} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, asset: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select affected asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pump Station A">Pump Station A</SelectItem>
            <SelectItem value="Conveyor Line 1">Conveyor Line 1</SelectItem>
            <SelectItem value="Conveyor Line 2">Conveyor Line 2</SelectItem>
            <SelectItem value="Conveyor Line 3">Conveyor Line 3</SelectItem>
            <SelectItem value="HVAC Unit 1">HVAC Unit 1</SelectItem>
            <SelectItem value="Generator">Emergency Generator</SelectItem>
            <SelectItem value="Compressor">Air Compressor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="urgency">Urgency Level</Label>
        <Select 
          value={formData.urgency} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {urgencyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <span className={option.color}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the issue"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="estimatedDowntime">Estimated Downtime</Label>
        <Input
          id="estimatedDowntime"
          value={formData.estimatedDowntime}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedDowntime: e.target.value }))}
          placeholder="e.g., 2-4 hours"
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional information"
          rows={2}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        disabled={!formData.title || !formData.description || !formData.asset}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Report Issue
      </Button>
    </form>
  );
};

export default UnplannedMaintenanceForm;
