
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

      // Invalidate queries first, then refetch to ensure fresh data
      console.log('🗑️ Invalidating asset queries...');
      await queryClient.invalidateQueries({ 
        queryKey: ["assets"]
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["assetHierarchy"]
      });
      
      // Force immediate refetch to ensure UI updates
      console.log('🗑️ Forcing refetch of asset data...');
      await queryClient.refetchQueries({ 
        queryKey: ["assets"]
      });
      await queryClient.refetchQueries({ 
        queryKey: ["assetHierarchy"]
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
