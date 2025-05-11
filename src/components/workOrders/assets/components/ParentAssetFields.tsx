
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues, Location } from "../AssetFormSchema";
import { LocationSelector } from "./LocationSelector";

type ParentAssetFieldsProps = {
  form: UseFormReturn<AssetFormValues>;
  locations: Location[] | undefined;
  onAddLocation: (locationName: string) => Promise<void>;
};

export const ParentAssetFields: React.FC<ParentAssetFieldsProps> = ({
  form,
  locations,
  onAddLocation,
}) => {
  return (
    <div className="border p-4 rounded-md bg-gray-50 space-y-4">
      <h3 className="text-md font-medium">New Parent Asset Details</h3>
      
      <FormField
        control={form.control}
        name="parent_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent Asset Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter parent asset name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="parent_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent Asset Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the parent asset" 
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LocationSelector
        form={form}
        locations={locations}
        onAddLocation={onAddLocation}
        fieldName="parent_location"
        label="Parent Asset Location"
      />
    </div>
  );
};
