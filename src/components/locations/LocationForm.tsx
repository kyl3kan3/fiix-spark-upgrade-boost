
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/services/locationService";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parent_id: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  locations: Location[];
  parentId?: string;
  initialData?: {
    name: string;
    description: string;
    parent_id: string | null;
  };
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: "create" | "edit";
}

export const LocationForm: React.FC<LocationFormProps> = ({
  locations,
  parentId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parent_id: parentId || initialData?.parent_id || "",
    }
  });

  const parentIdValue = watch("parent_id");

  const handleFormSubmit = async (data: LocationFormData) => {
    try {
      await onSubmit({
        ...data,
        parent_id: data.parent_id === "" ? undefined : data.parent_id
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter location name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter location description"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent_id">Parent Location</Label>
        <Select
          value={parentIdValue || ""}
          onValueChange={(value) => setValue("parent_id", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent location (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No parent (root location)</SelectItem>
            {locations
              .filter(location => mode === "edit" ? location.id !== initialData?.parent_id : true)
              .map((location) => (
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
          disabled={isLoading}
          className="bg-maintenease-600 hover:bg-maintenease-700"
        >
          {isLoading ? "Saving..." : mode === "create" ? "Create Location" : "Update Location"}
        </Button>
      </div>
    </form>
  );
};
