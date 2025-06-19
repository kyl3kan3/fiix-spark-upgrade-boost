import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues } from "./AssetFormSchema";
import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "@/services/assets/assetQueries";
import { getAllLocations, createLocation } from "@/services/locationService";
import { BasicAssetFields } from "./components/BasicAssetFields";
import { ParentAssetSelector } from "./components/ParentAssetSelector";
import { ParentAssetFields } from "./components/ParentAssetFields";

type AssetFormFieldsProps = {
  form: UseFormReturn<AssetFormValues>;
  currentAssetId?: string;
};

export const AssetFormFields: React.FC<AssetFormFieldsProps> = ({ form, currentAssetId }) => {
  const [showParentFields, setShowParentFields] = useState(false);
  
  console.log("AssetFormFields rendering with currentAssetId:", currentAssetId);
  
  // Fetch all assets for parent selection
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets
  });

  // Fetch all locations for location dropdown
  const { data: locationsData, isLoading: locationsLoading, refetch: refetchLocations } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations
  });

  // Ensure assets and locations are always arrays
  const assets = Array.isArray(assetsData) ? assetsData : [];
  const locations = Array.isArray(locationsData) ? locationsData : [];

  console.log("Assets loaded:", assets.length);
  console.log("Locations loaded:", locations.length);

  // Filter out the current asset (we can't set an asset as its own parent)
  const availableParentAssets = assets.filter(asset => asset.id !== currentAssetId);

  // Handle adding new location
  const handleAddLocation = async (locationName: string) => {
    try {
      await createLocation({ name: locationName });
      refetchLocations();
    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  // Handle parent asset selection change
  const handleParentChange = (value: string) => {
    console.log("Parent asset selection changed to:", value);
    form.setValue("parent_id", value);
    setShowParentFields(value === "new");
    
    if (value !== "new") {
      // Reset parent fields if not creating a new parent
      form.setValue("parent_name", "");
      form.setValue("parent_description", "");
      form.setValue("parent_location_id", "");
    }
  };

  if (assetsLoading || locationsLoading) {
    return <div className="text-center py-4">Loading form data...</div>;
  }

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
