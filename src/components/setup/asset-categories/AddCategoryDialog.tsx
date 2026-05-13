import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AssetCategory } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AssetCategory;
  onValueChange: (next: AssetCategory) => void;
  onSubmit: () => void;
}

export const AddCategoryDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  value,
  onValueChange,
  onSubmit,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" /> Category
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Category</DialogTitle>
        <DialogDescription>Create a new category for your assets</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="name">Category Name*</Label>
          <Input
            id="name"
            value={value.name}
            onChange={(e) => onValueChange({ ...value, name: e.target.value })}
            placeholder="e.g. HVAC Systems"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={value.description}
            onChange={(e) => onValueChange({ ...value, description: e.target.value })}
            placeholder="Description of this asset category"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!value.name}>
          Add Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
