
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

      // Force refresh all asset-related queries to ensure we have fresh data
      console.log('🗑️ Invalidating and refetching all asset queries...');
      
      // Remove all cached queries and force fresh fetch
      queryClient.removeQueries({ queryKey: ["assets"] });
      queryClient.removeQueries({ queryKey: ["assetHierarchy"] });
      queryClient.removeQueries({ queryKey: ["assets", assetId] });
      
      // Force immediate refetch of both queries to get fresh data
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ["assets"],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({ 
          queryKey: ["assetHierarchy"],
          refetchType: 'active'
        })
      ]);
      
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
