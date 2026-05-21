import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fieldTypeOptions, type CustomField } from "./types";

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  value: CustomField;
  onValueChange: (next: CustomField) => void;
  dropdownOptions: string;
  onDropdownOptionsChange: (next: string) => void;
  onSubmit: () => void;
}

export const AddFieldDialog: React.FC<AddFieldDialogProps> = ({
  open,
  onOpenChange,
  categoryName,
  value,
  onValueChange,
  dropdownOptions,
  onDropdownOptionsChange,
  onSubmit,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Field
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Custom Field</DialogTitle>
        <DialogDescription>Add a custom field for {categoryName} assets</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="fieldName">Field Name*</Label>
          <Input
            id="fieldName"
            value={value.name}
            onChange={(e) => onValueChange({ ...value, name: e.target.value })}
            placeholder="e.g. Serial Number"
          />
        </div>
        <div>
          <Label htmlFor="fieldType">Field Type*</Label>
          <select
            id="fieldType"
            className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={value.type}
            onChange={(e) => onValueChange({ ...value, type: e.target.value as CustomField["type"] })}
          >
            {fieldTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        {value.type === "dropdown" && (
          <div>
            <Label htmlFor="options">Options (comma-separated)</Label>
            <Input
              id="options"
              value={dropdownOptions}
              onChange={(e) => onDropdownOptionsChange(e.target.value)}
              placeholder="Option 1, Option 2, Option 3"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter options separated by commas</p>
          </div>
        )}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="required"
            checked={value.required}
            onCheckedChange={(checked) => onValueChange({ ...value, required: checked === true })}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="required"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Required Field
            </label>
            <p className="text-sm text-muted-foreground">
              This field must be filled when creating assets
            </p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSubmit} disabled={!value.name}>Add Field</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
