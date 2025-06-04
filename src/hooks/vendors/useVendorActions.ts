
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVendor } from "@/services/vendorService";
import { toast } from "sonner";

export const useVendorActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      console.log("Vendor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor", {
        description: error.message || "An unexpected error occurred"
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  const handleDeleteVendor = async (vendorId: string) => {
    console.log("Starting vendor deletion for ID:", vendorId);
    setIsDeleting(true);
    deleteMutation.mutate(vendorId);
  };

  const handleBulkDeleteVendors = async (vendorIds: string[]) => {
    console.log("Starting bulk vendor deletion for IDs:", vendorIds);
    setIsDeleting(true);
    
    try {
      let successCount = 0;
      let failureCount = 0;
      
      // Delete vendors one by one with better error handling
      for (const vendorId of vendorIds) {
        try {
          console.log("Deleting vendor:", vendorId);
          await deleteVendor(vendorId);
          successCount++;
        } catch (error: any) {
          console.error("Failed to delete vendor:", vendorId, error);
          failureCount++;
        }
      }
      
      console.log(`Bulk deletion completed: ${successCount} successful, ${failureCount} failed`);
      
      // Refresh vendor list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} vendor${successCount !== 1 ? 's' : ''}`);
      }
      
      if (failureCount > 0) {
        toast.error(`Failed to delete ${failureCount} vendor${failureCount !== 1 ? 's' : ''}`);
      }
      
    } catch (error: any) {
      console.error("Error bulk deleting vendors:", error);
      toast.error("Bulk deletion failed", {
        description: error.message || "An unexpected error occurred"
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteVendor,
    handleBulkDeleteVendors
  };
};
