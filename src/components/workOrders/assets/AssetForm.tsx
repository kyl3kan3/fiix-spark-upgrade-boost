
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Cpu, GitBranch, ImageIcon } from "lucide-react";
import { AssetFormFields } from "./AssetFormFields";
import { AssetFormValues, assetFormSchema } from "./AssetFormSchema";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { createAsset, createParentAsset, updateAsset } from "@/services/assets/assetMutations";
import { getAssetById } from "@/services/assets/assetQueries";
import { logger } from "@/lib/logger";

interface AssetFormProps {
  assetId?: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ assetId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  logger.log("AssetForm rendering with assetId:", assetId);

  const { data: existingAsset, isLoading: assetLoading, error: assetError } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => getAssetById(assetId!),
    enabled: !!assetId,
  });

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location_id: "",
      model: "",
      serial_number: "",
      purchase_date: "",
      status: "active",
      parent_id: "",
      parent_name: "",
      parent_description: "",
      parent_location_id: "",
      new_location: false,
      new_location_name: "",
      image_url: null,
    },
  });

  useEffect(() => {
    if (existingAsset) {
      logger.log("Loading existing asset data:", existingAsset);
      form.reset({
        name: existingAsset.name || "",
        description: existingAsset.description || "",
        location_id: existingAsset.location_id || "",
        model: existingAsset.model || "",
        serial_number: existingAsset.serial_number || "",
        purchase_date: existingAsset.purchase_date || "",
        status: (existingAsset.status as "active" | "inactive" | "maintenance" | "retired") || "active",
        parent_id: existingAsset.parent_id || "",
        parent_name: "",
        parent_description: "",
        parent_location_id: "",
        new_location: false,
        new_location_name: "",
        image_url: (existingAsset as any).image_url ?? null,
      });
    }
  }, [existingAsset, form]);

  const onSubmit = async (data: AssetFormValues) => {
    setIsSubmitting(true);
    try {
      logger.log("Submitting asset data:", data);

      if (data.parent_id === "new" && data.parent_name) {
        const parentAssetData = {
          name: data.parent_name,
          description: data.parent_description || "",
          location_id: data.parent_location_id || null,
          status: "active",
        };
        logger.log("Creating parent asset:", parentAssetData);
        const parentResult = await createParentAsset(parentAssetData);
        if (parentResult.error) throw new Error(parentResult.error.message);
        data.parent_id = parentResult.data[0].id;
      }

      let result;
      if (assetId) {
        logger.log("Updating asset:", assetId, data);
        result = await updateAsset(assetId, data);
      } else {
        logger.log("Creating new asset:", data);
        result = await createAsset(data);
      }

      if (result.error) {
        console.error("Asset operation error:", result.error);
        throw new Error(result.error.message);
      }

      logger.log("Asset operation successful:", result);
      toast.success(assetId ? "Asset updated successfully!" : "Asset created successfully!");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetHierarchy"] });
      navigate("/assets");
    } catch (error) {
      console.error("Error submitting asset:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (assetError) {
    console.error("Error loading asset:", assetError);
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <p className="text-center text-destructive">
          Error loading asset: {assetError.message}
        </p>
      </div>
    );
  }

  if (assetId && assetLoading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Asset details section */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Asset Details</h2>
          </div>
          <AssetFormFields form={form} currentAssetId={assetId} />
        </div>

        {/* Photo section */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Equipment Photo</h2>
          </div>
          <ImageUploadField
            label="Equipment photo"
            folder="assets"
            value={form.watch("image_url") ?? null}
            onChange={(url) => form.setValue("image_url", url, { shouldDirty: true })}
            helperText="Optional — helps technicians identify the unit on site."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/assets")}
            disabled={isSubmitting}
            className="uppercase tracking-wide font-semibold text-xs px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="uppercase tracking-wide font-semibold text-xs px-8 gap-2 shadow-sm"
          >
            {isSubmitting
              ? assetId ? "Updating…" : "Creating…"
              : assetId ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
