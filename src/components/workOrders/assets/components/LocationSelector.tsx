
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { Location, AssetFormValues } from "../AssetFormSchema";
import { useToast } from "@/hooks/use-toast";

type LocationSelectorProps = {
  form: UseFormReturn<AssetFormValues>;
  locations: Location[] | undefined;
  onAddLocation: (locationName: string) => Promise<void>;
  isLoading?: boolean;
  fieldName: "location" | "parent_location";
  label?: string;
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  form,
  locations,
  onAddLocation,
  isLoading = false,
  fieldName,
  label = "Location",
}) => {
  const { toast } = useToast();
  const [showNewLocationField, setShowNewLocationField] = React.useState(false);

  const handleAddLocation = async () => {
    const newLocationName = form.getValues("new_location_name");

    if (!newLocationName?.trim()) {
      toast({ title: "Error", description: "Please enter a location name", variant: "destructive" });
      return;
    }

    try {
      await onAddLocation(newLocationName);
      toast({ title: "Success", description: "Location added successfully" });
      form.setValue("new_location_name", "");
      setShowNewLocationField(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add location", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">{label}</FormLabel>
            <div className="flex gap-2">
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={showNewLocationField}
              >
                <FormControl>
                  <SelectTrigger
                    className={`bg-muted/30 border-border/60 ${showNewLocationField ? "opacity-50" : ""}`}
                  >
                    <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowNewLocationField(!showNewLocationField)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {showNewLocationField && (
        <div className="flex gap-2 pt-2">
          <FormField
            control={form.control}
            name="new_location_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Enter new location name"
                    className="bg-muted/30 border-border/60 focus-visible:ring-primary/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            onClick={handleAddLocation}
            className="uppercase tracking-wide font-semibold text-xs"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
};
