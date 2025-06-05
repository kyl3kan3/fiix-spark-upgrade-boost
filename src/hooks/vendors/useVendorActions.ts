
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVendor } from "@/services/vendorService";
import { toast } from "sonner";

export const useVendorActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (vendorIds: string[]) => {
      await Promise.all(vendorIds.map(id => deleteVendor(id)));
    },
    onSuccess: (_, vendorIds) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(`${vendorIds.length} vendor(s) deleted successfully`);
      setSelectedVendors([]);
    },
    onError: (error: any) => {
      console.error("Error deleting vendors:", error);
      toast.error("Failed to delete vendors", {
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

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) return;
    setIsDeleting(true);
    bulkDeleteMutation.mutate(selectedVendors);
  };

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const selectAllVendors = (vendorIds: string[]) => {
    setSelectedVendors(vendorIds);
  };

  const clearSelection = () => {
    setSelectedVendors([]);
  };

  return {
    isDeleting,
    selectedVendors,
    handleDeleteVendor,
    handleBulkDelete,
    toggleVendorSelection,
    selectAllVendors,
    clearSelection
  };
};
