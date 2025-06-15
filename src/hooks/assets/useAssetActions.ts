
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAsset } from "@/services/assets/assetMutations";

export const useAssetActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAsset = async (assetId: string) => {
    console.log('🗑️ Starting asset deletion for ID:', assetId);
    setIsDeleting(true);
    try {
      console.log('🗑️ Calling deleteAsset service...');
      await deleteAsset(assetId);
      console.log('🗑️ Asset deleted successfully from database');

      // Remove the asset from cache immediately before invalidating
      console.log('🗑️ Removing asset from cache...');
      queryClient.setQueryData(["assets"], (oldData: any) => {
        if (!oldData) return oldData;
        const filteredData = oldData.filter((asset: any) => asset.id !== assetId);
        console.log('🗑️ Assets cache updated, removed asset:', assetId);
        return filteredData;
      });
      
      queryClient.setQueryData(["assetHierarchy"], (oldData: any) => {
        if (!oldData) return oldData;
        const removeAssetFromHierarchy = (assets: any[]): any[] => {
          return assets
            .filter(asset => asset.id !== assetId)
            .map(asset => ({
              ...asset,
              children: asset.children ? removeAssetFromHierarchy(asset.children) : []
            }));
        };
        const filteredHierarchy = removeAssetFromHierarchy(oldData);
        console.log('🗑️ Hierarchy cache updated, removed asset:', assetId);
        return filteredHierarchy;
      });

      // Only invalidate, don't refetch to avoid overwriting our manual updates
      console.log('🗑️ Invalidating queries without refetch...');
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetHierarchy"] });
      
      console.log('🗑️ Asset deletion process completed successfully');
      toast.success("Asset deleted successfully");
    } catch (err: any) {
      console.error("❌ Error deleting asset:", err);
      toast.error(err.message || "Failed to delete asset");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteAsset,
  };
};
