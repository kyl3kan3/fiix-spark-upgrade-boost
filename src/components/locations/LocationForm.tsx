
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
import { ImageUploadField } from "@/components/common/ImageUploadField";

const locationSchema = z.object({
 name: z.string().min(1, "Name is required"),
 description: z.string().optional(),
 parent_id: z.string().optional(),
 image_url: z.string().url().nullable().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
 locations: Location[];
 parentId?: string;
 initialData?: {
 name: string;
 description: string;
 parent_id: string | null;
 image_url?: string | null;
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
 image_url: initialData?.image_url ?? null,
 }
 });

 const parentIdValue = watch("parent_id");
 const imageUrlValue = watch("image_url");

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
 <p className="text-sm text-destructive">{errors.name.message}</p>
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
    value={parentIdValue || "none"}
    onValueChange={(value) => setValue("parent_id", value === "none" ? "" : value)}
 disabled={isLoading}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select parent location (optional)" />
 </SelectTrigger>
 <SelectContent>
      <SelectItem value="none">No parent (root location)</SelectItem>
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

 <ImageUploadField
 label="Location photo"
 folder="locations"
 value={imageUrlValue ?? null}
 onChange={(url) =>
 setValue("image_url", url, { shouldDirty: true })
 }
 disabled={isLoading}
 helperText="Optional — a photo of the room, building, or area."
 />

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
 className="bg-primary hover:bg-primary/90"
 >
 {isLoading ? "Saving..." : mode === "create" ? "Create Location" : "Update Location"}
 </Button>
 </div>
 </form>
 );
};
