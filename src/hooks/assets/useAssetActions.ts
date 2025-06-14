
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAsset } from "@/services/assets/assetMutations";

export const useAssetActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAsset = async (assetId: string) => {
    console.log('🗑️ Delete asset requested for ID:', assetId);
    
    // Show confirmation first
    const confirmDelete = window.confirm("Are you sure you want to delete this asset? This action cannot be undone.");
    if (!confirmDelete) {
      console.log('❌ User cancelled deletion');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('🔄 Starting asset deletion process...');
      
      // Check current cache state before deletion
      const assetsData = queryClient.getQueryData(["assets"]);
      const hierarchyData = queryClient.getQueryData(["assetHierarchy"]);
      console.log('📊 Current cache - assets:', assetsData);
      console.log('📊 Current cache - assetHierarchy:', hierarchyData);
      
      await deleteAsset(assetId);
      console.log('✅ Asset deletion API call completed');
      
      // Completely clear the cache and force new requests
      console.log('🗑️ Clearing all asset cache...');
      queryClient.removeQueries({ queryKey: ["assets"] });
      queryClient.removeQueries({ queryKey: ["assetHierarchy"] });
      
      // Wait a moment then force fresh data
      setTimeout(async () => {
        console.log('🔄 Forcing fresh data fetch...');
        await queryClient.invalidateQueries({ queryKey: ["assets"] });
        await queryClient.invalidateQueries({ queryKey: ["assetHierarchy"] });
        
        // Double check the new data
        const newAssetsData = queryClient.getQueryData(["assets"]);
        const newHierarchyData = queryClient.getQueryData(["assetHierarchy"]);
        console.log('📊 After refresh - assets:', newAssetsData);
        console.log('📊 After refresh - assetHierarchy:', newHierarchyData);
      }, 100);
      
      console.log('✅ Queries refreshed, asset should be removed from UI');
      toast.success("Asset deleted successfully");
      
    } catch (err: any) {
      console.error("❌ Error deleting asset:", err);
      toast.error(err.message || "Failed to delete asset");
    } finally {
      setIsDeleting(false);
      console.log('🏁 Delete operation completed');
    }
  };

  return {
    isDeleting,
    handleDeleteAsset
  };
};
