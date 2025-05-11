
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues } from "./AssetFormSchema";
import { useQuery } from "@tanstack/react-query";
import { getAllAssets, getAllLocations, createLocation } from "@/services/assetService";
import { BasicAssetFields } from "./components/BasicAssetFields";
import { ParentAssetSelector } from "./components/ParentAssetSelector";
import { ParentAssetFields } from "./components/ParentAssetFields";

type AssetFormFieldsProps = {
  form: UseFormReturn<AssetFormValues>;
  currentAssetId?: string; // Optional ID of current asset when editing
};

export const AssetFormFields: React.FC<AssetFormFieldsProps> = ({ form, currentAssetId }) => {
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
  const handleAddLocation = async (newLocationName: string) => {
    await createLocation(newLocationName);
    // Refetch locations
    refetchLocations();
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
      <BasicAssetFields
        form={form}
        locations={locations}
        onAddLocation={handleAddLocation}
      />

      <ParentAssetSelector
        form={form}
        availableParentAssets={availableParentAssets}
        onParentChange={handleParentChange}
      />

      {showParentFields && (
        <ParentAssetFields
          form={form}
          locations={locations}
          onAddLocation={handleAddLocation}
        />
      )}
    </>
  );
};
