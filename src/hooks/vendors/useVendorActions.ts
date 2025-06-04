
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
    setIsDeleting(true);
    deleteMutation.mutate(vendorId);
  };

  const handleBulkDeleteVendors = async (vendorIds: string[]) => {
    setIsDeleting(true);
    
    try {
      // Delete vendors one by one
      for (const vendorId of vendorIds) {
        await deleteVendor(vendorId);
      }
      
      // Refresh vendor list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      
    } catch (error: any) {
      console.error("Error bulk deleting vendors:", error);
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
