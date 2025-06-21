
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";

interface ChecklistFormData {
  name: string;
  description: string;
  type: string;
  frequency: string;
  is_active: boolean;
}

interface BasicInformationSectionProps {
  formData: ChecklistFormData;
  onUpdate: (field: keyof ChecklistFormData, value: any) => void;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  formData,
  onUpdate
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="Enter checklist name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => onUpdate("type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ChecklistTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => onUpdate("frequency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ChecklistFrequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onUpdate("is_active", !!checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Enter checklist description"
          rows={3}
        />
      </div>
    </Card>
  );
};

export default BasicInformationSection;
