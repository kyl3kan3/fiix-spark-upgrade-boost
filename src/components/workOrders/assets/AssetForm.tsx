
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetFormFields } from "./AssetFormFields";
import { AssetFormValues, assetFormSchema } from "./AssetFormSchema";
import { createAsset, createParentAsset, getAssetById, updateAsset } from "@/services/assetService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

interface AssetFormProps {
  assetId?: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ assetId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Get existing asset data if editing
  const { data: existingAsset } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => getAssetById(assetId!),
    enabled: !!assetId
  });

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: existingAsset?.name || "",
      description: existingAsset?.description || "",
      location_id: existingAsset?.location_id || "",
      model: existingAsset?.model || "",
      serial_number: existingAsset?.serial_number || "",
      purchase_date: existingAsset?.purchase_date || "",
      status: (existingAsset?.status as "active" | "inactive" | "maintenance" | "retired") || "active",
      parent_id: existingAsset?.parent_id || "",
      parent_name: "",
      parent_description: "",
      parent_location_id: "",
      new_location: false,
      new_location_name: "",
    },
  });

  const onSubmit = async (data: AssetFormValues) => {
    setIsSubmitting(true);
    try {
      // If creating a new parent asset
      if (data.parent_id === "new" && data.parent_name) {
        const parentAssetData = {
          name: data.parent_name,
          description: data.parent_description || "",
          location_id: data.parent_location_id || null,
          status: "active"
        };
        
        const parentResult = await createParentAsset(parentAssetData);
        
        if (parentResult.error) {
          throw new Error(parentResult.error.message);
        }
        
        // Set the newly created parent's ID
        data.parent_id = parentResult.data[0].id;
      }

      // Create or update the main asset
      let result;
      if (assetId) {
        result = await updateAsset(assetId, data);
      } else {
        result = await createAsset(data);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success(assetId ? "Asset updated successfully!" : "Asset created successfully!");
      
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetHierarchy"] });
      
      // Reset form if creating new asset
      if (!assetId) {
        form.reset();
      }
      
    } catch (error) {
      console.error("Error submitting asset:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{assetId ? "Edit Asset" : "Create New Asset"}</CardTitle>
          <CardDescription>
            {assetId ? "Update asset information" : "Add a new asset to your inventory"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AssetFormFields form={form} currentAssetId={assetId} />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (assetId ? "Updating..." : "Creating...") 
                  : (assetId ? "Update Asset" : "Create Asset")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};
