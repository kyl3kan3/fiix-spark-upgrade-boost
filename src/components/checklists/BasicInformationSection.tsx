import React from "react";
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
  onUpdate,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6">
      <div className="border-b border-border pb-4 mb-6">
        <input
          className="w-full bg-transparent border-0 border-b-2 border-border focus:border-primary focus:outline-none focus:ring-0 font-headline text-xl text-foreground px-0 py-2 mb-2 placeholder:text-muted-foreground/50"
          placeholder="Checklist Title"
          value={formData.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          required
        />
        <input
          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-muted-foreground px-0 py-1"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </Label>
          <Select value={formData.type} onValueChange={(v) => onUpdate("type", v)}>
            <SelectTrigger className="bg-muted/40 border-none focus:ring-primary">
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
          <Label htmlFor="frequency" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Frequency
          </Label>
          <Select value={formData.frequency} onValueChange={(v) => onUpdate("frequency", v)}>
            <SelectTrigger className="bg-muted/40 border-none focus:ring-primary">
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

        <div className="flex items-center gap-3 pt-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onUpdate("is_active", !!checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
            Active template
          </Label>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;
