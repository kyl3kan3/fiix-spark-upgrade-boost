
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssetFormData } from "@/types/workOrders";
import { AssetFormFields } from "./AssetFormFields";
import { assetFormSchema, AssetFormValues } from "./AssetFormSchema";
import { createAsset, getAssetById, updateAsset, createParentAsset } from "@/services/assetService";

type AssetFormProps = {
  initialData?: AssetFormData;
  assetId?: string;
  onSuccess?: () => void;
};

const AssetForm = ({ assetId, onSuccess }: AssetFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!assetId;

  // Fetch asset data if editing
  const { data: assetData, isLoading } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => assetId ? getAssetById(assetId) : null,
    enabled: !!assetId,
  });

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      model: "",
      serial_number: "",
      purchase_date: "",
      status: "active",
      parent_id: "none",
      parent_name: "",
      parent_description: "",
      new_location: false,
      new_location_name: ""
    },
  });

  // Update form values when asset data is loaded
  useEffect(() => {
    if (assetData && isEditing) {
      form.reset({
        name: assetData.name,
        description: assetData.description || "",
        location: assetData.location || "",
        model: assetData.model || "",
        serial_number: assetData.serial_number || "",
        purchase_date: assetData.purchase_date 
          ? new Date(assetData.purchase_date).toISOString().split("T")[0] 
          : "",
        status: assetData.status,
        parent_id: assetData.parent_id || "none",
        parent_name: "",
        parent_description: "",
        new_location: false,
        new_location_name: ""
      });
    }
  }, [assetData, form, isEditing]);

  const onSubmit = async (values: AssetFormValues) => {
    try {
      let parentId = values.parent_id;
      
      // If creating a new parent asset
      if (values.parent_id === "new" && values.parent_name) {
        const parentResponse = await createParentAsset({
          name: values.parent_name,
          description: values.parent_description || "",
          location: values.location,
          status: "active",
        });
        
        if (parentResponse.error) {
          throw parentResponse.error;
        }
        
        // Use the newly created parent asset's ID
        parentId = parentResponse.data?.[0]?.id;
      }
      
      // Prepare the asset data for creation/update
      const assetData = {
        name: values.name,
        description: values.description,
        location: values.location,
        model: values.model,
        serial_number: values.serial_number,
        purchase_date: values.purchase_date,
        status: values.status,
        parent_id: parentId === "new" ? null : parentId
      };
      
      let response;
      
      if (isEditing && assetId) {
        response = await updateAsset(assetId, assetData);
      } else {
        response = await createAsset(assetData);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "Asset Updated" : "Asset Created",
        description: isEditing 
          ? "The asset has been updated successfully." 
          : "A new asset has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/assets");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading asset data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AssetFormFields form={form} currentAssetId={assetId} />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/assets")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssetForm;
