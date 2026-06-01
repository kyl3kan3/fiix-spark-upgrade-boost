
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues, Location } from "../AssetFormSchema";

type BasicAssetFieldsProps = {
  form: UseFormReturn<AssetFormValues>;
  locations: Location[] | undefined;
  onAddLocation: (locationName: string) => Promise<void>;
};

export const BasicAssetFields: React.FC<BasicAssetFieldsProps> = ({ form, locations }) => {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Asset Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter asset name"
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter asset description"
                className="min-h-[90px] bg-muted/30 border-border/60 focus-visible:ring-primary/30 resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Location</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-muted/30 border-border/60">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.description && (
                      <span className="text-muted-foreground ml-2">({location.description})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">Model</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter model"
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
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">Serial Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter serial number"
                  className="bg-muted/30 border-border/60 focus-visible:ring-primary/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">Purchase Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-muted/30 border-border/60">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
