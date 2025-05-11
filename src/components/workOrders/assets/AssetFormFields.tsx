
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues } from "./AssetFormSchema";
import { useQuery } from "@tanstack/react-query";
import { getAllAssets, getAllLocations, createLocation } from "@/services/assetService";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AssetFormFieldsProps = {
  form: UseFormReturn<AssetFormValues>;
  currentAssetId?: string; // Optional ID of current asset when editing
};

export const AssetFormFields: React.FC<AssetFormFieldsProps> = ({ form, currentAssetId }) => {
  const { toast } = useToast();
  const [showNewLocationField, setShowNewLocationField] = useState(false);
  const [showParentFields, setShowParentFields] = useState(false);
  
  // Fetch all assets for parent selection
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets
  });

  // Fetch all locations for location dropdown
  const { data: locations, isLoading: locationsLoading, refetch: refetchLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: getAllLocations
  });

  // Filter out the current asset (we can't set an asset as its own parent)
  const availableParentAssets = assets?.filter(asset => asset.id !== currentAssetId) || [];

  // Handle adding new location
  const handleAddLocation = async () => {
    const newLocationName = form.getValues("new_location_name");
    
    if (!newLocationName?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createLocation(newLocationName);
      toast({
        title: "Success",
        description: "Location added successfully"
      });
      
      // Reset the new location field
      form.setValue("new_location_name", "");
      setShowNewLocationField(false);
      
      // Refetch locations
      refetchLocations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive"
      });
    }
  };

  // Handle parent asset selection change
  const handleParentChange = (value: string) => {
    form.setValue("parent_id", value);
    setShowParentFields(value === "new");
    
    if (value !== "new") {
      // Reset parent fields if not creating a new parent
      form.setValue("parent_name", "");
      form.setValue("parent_description", "");
      form.setValue("parent_location", ""); // Reset parent location
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asset Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter asset name" {...field} />
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the asset" 
                className="min-h-[100px]"
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <div className="flex space-x-2">
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    disabled={showNewLocationField}
                  >
                    <FormControl>
                      <SelectTrigger className={showNewLocationField ? "opacity-50" : ""}>
                        <SelectValue placeholder="Select a location" />
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
            <div className="flex space-x-2 pt-2">
              <FormField
                control={form.control}
                name="new_location_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Enter new location name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={handleAddLocation}>Add</Button>
            </div>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="Asset model" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="Serial number" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="parent_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parent Asset</FormLabel>
            <Select 
              onValueChange={handleParentChange}
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent asset (optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None (Top Level Asset)</SelectItem>
                <SelectItem value="new">+ Create New Parent Asset</SelectItem>
                {availableParentAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showParentFields && (
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

          {/* Add location field for parent asset */}
          <FormField
            control={form.control}
            name="parent_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Asset Location</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location for parent asset" />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};
