
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AssetFormData } from "@/types/workOrders";
import { AssetFormFields } from "./AssetFormFields";
import { assetFormSchema, AssetFormValues } from "./AssetFormSchema";
import { createAsset, updateAsset } from "@/services/assetService";

type AssetFormProps = {
  initialData?: AssetFormData;
  assetId?: string;
  onSuccess?: () => void;
};

const AssetForm = ({ initialData, assetId, onSuccess }: AssetFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!assetId;

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      model: initialData?.model || "",
      serial_number: initialData?.serial_number || "",
      purchase_date: initialData?.purchase_date 
        ? new Date(initialData.purchase_date).toISOString().split("T")[0] 
        : "",
      status: initialData?.status || "active"
    },
  });

  const onSubmit = async (values: AssetFormValues) => {
    try {
      let response;
      
      if (isEditing && assetId) {
        response = await updateAsset(assetId, values);
      } else {
        response = await createAsset(values);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AssetFormFields form={form} />
        
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
