
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";

interface ChecklistItemForm {
  id?: string;
  title: string;
  description: string;
  item_type: "checkbox" | "text" | "number" | "date";
  is_required: boolean;
  sort_order: number;
}

interface ChecklistItemFormProps {
  item: ChecklistItemForm;
  index: number;
  totalItems: number;
  onUpdate: (field: keyof ChecklistItemForm, value: any) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

const ChecklistItemForm: React.FC<ChecklistItemFormProps> = ({
  item,
  index,
  totalItems,
  onUpdate,
  onRemove,
  onMove
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Item {index + 1}</span>
          {item.is_required && (
            <Badge variant="outline">Required</Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {item.item_type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMove("up")}
            disabled={index === 0}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMove("down")}
            disabled={index === totalItems - 1}
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            value={item.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Enter item title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={item.item_type}
            onValueChange={(value) => onUpdate("item_type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Enter item description (optional)"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`required-${index}`}
          checked={item.is_required}
          onCheckedChange={(checked) => onUpdate("is_required", !!checked)}
        />
        <Label htmlFor={`required-${index}`}>Required field</Label>
      </div>
    </div>
  );
};

export default ChecklistItemForm;
