
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Location } from "@/services/locationService";

interface LocationFormProps {
  locations: Location[];
  parentId?: string;
  initialData?: {
    name: string;
    description: string;
    parent_id: string | null;
  };
  onSubmit: (data: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export const LocationForm: React.FC<LocationFormProps> = ({
  locations,
  parentId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create"
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedParentId, setSelectedParentId] = useState<string>("none");

  // Set the parent ID when component mounts or parentId changes
  useEffect(() => {
    if (initialData?.parent_id) {
      setSelectedParentId(initialData.parent_id);
    } else if (parentId) {
      setSelectedParentId(parentId);
    } else {
      setSelectedParentId("none");
    }
  }, [parentId, initialData?.parent_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      parent_id: selectedParentId === "none" ? null : selectedParentId
    });
  };

  // Only filter out locations that would create circular references
  // Don't filter out the intended parent location
  const availableParents = locations;

  // Find the selected parent location name for display
  const selectedParentName = selectedParentId !== "none" 
    ? locations.find(loc => loc.id === selectedParentId)?.name 
    : "No parent (root location)";

  const isEditMode = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Location Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter location description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="parent">Parent Location</Label>
        <Select 
          value={selectedParentId} 
          onValueChange={setSelectedParentId}
          disabled={isLoading || (!!parentId && !isEditMode)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent location (optional)">
              {selectedParentName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent (root location)</SelectItem>
            {availableParents.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading || !name.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Location" : "Add Location")}
        </Button>
      </div>
    </form>
  );
};
