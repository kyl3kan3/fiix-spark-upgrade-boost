
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
      console.log('🗑️ Asset deleted successfully, showing toast...');
      toast.success("Asset deleted successfully");

      console.log('🗑️ Invalidating and refetching queries...');
      // More aggressive cache invalidation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
        queryClient.invalidateQueries({ queryKey: ["assetHierarchy"] }),
        queryClient.refetchQueries({ queryKey: ["assets"] }),
        queryClient.refetchQueries({ queryKey: ["assetHierarchy"] })
      ]);
      
      // Also remove the specific asset from cache immediately
      queryClient.setQueryData(["assets"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((asset: any) => asset.id !== assetId);
      });
      
      queryClient.setQueryData(["assetHierarchy"], (oldData: any) => {
        if (!oldData) return oldData;
        // Remove from hierarchy - this is more complex but ensures UI updates
        const removeAssetFromHierarchy = (assets: any[]): any[] => {
          return assets
            .filter(asset => asset.id !== assetId)
            .map(asset => ({
              ...asset,
              children: asset.children ? removeAssetFromHierarchy(asset.children) : []
            }));
        };
        return removeAssetFromHierarchy(oldData);
      });
      
      console.log('🗑️ Cache updated and queries refetched successfully');
    } catch (err: any) {
      console.error("❌ Error deleting asset:", err);
      toast.error(err.message || "Failed to delete asset");
    } finally {
      setIsDeleting(false);
      console.log('🗑️ Asset deletion process completed');
    }
  };

  return {
    isDeleting,
    handleDeleteAsset,
  };
};
