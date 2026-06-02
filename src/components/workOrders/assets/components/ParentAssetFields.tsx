
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
    <div className="border border-border/60 rounded-lg bg-muted/20 p-4 space-y-5">
      <p className="text-sm font-semibold text-muted-foreground">New Parent Asset Details</p>

      <FormField
        control={form.control}
        name="parent_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Parent Asset Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter parent asset name"
                className="bg-muted/30 border-border/60 focus-visible:ring-primary/30"
                {...field}
              />
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
            <FormLabel className="text-sm font-semibold text-muted-foreground">Parent Asset Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the parent asset"
                className="min-h-[80px] bg-muted/30 border-border/60 focus-visible:ring-primary/30 resize-none"
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
