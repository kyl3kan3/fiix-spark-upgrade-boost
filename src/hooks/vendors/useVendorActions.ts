
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

  return {
    isDeleting,
    handleDeleteVendor
  };
};
