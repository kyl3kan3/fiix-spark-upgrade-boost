
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

      // Immediately remove from all caches and cancel any ongoing queries
      console.log('🗑️ Cancelling ongoing queries and removing from cache...');
      
      // Cancel any outgoing queries that might overwrite our cache changes
      await queryClient.cancelQueries({ queryKey: ["assets"] });
      await queryClient.cancelQueries({ queryKey: ["assetHierarchy"] });

      // Remove the asset from cache immediately
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

      // Remove the specific asset from cache if it exists
      queryClient.removeQueries({ queryKey: ["assets", assetId] });
      
      // Invalidate but prevent automatic refetch to avoid race conditions
      queryClient.invalidateQueries({ 
        queryKey: ["assets"],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({ 
        queryKey: ["assetHierarchy"],
        refetchType: 'none'
      });
      
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
