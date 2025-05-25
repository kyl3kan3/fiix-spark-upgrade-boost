
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Location } from "@/services/locationService";

interface LocationFormProps {
  locations: Location[];
  parentId?: string;
  onSubmit: (data: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  locations,
  parentId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string>(parentId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      parent_id: selectedParentId || null
    });
  };

  // Filter out potential circular references (don't allow a location to be its own parent)
  const availableParents = locations.filter(loc => loc.id !== parentId);

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
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent location (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No parent (root location)</SelectItem>
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
          {isLoading ? "Adding..." : "Add Location"}
        </Button>
      </div>
    </form>
  );
};
