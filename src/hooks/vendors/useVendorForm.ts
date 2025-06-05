
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { createVendor, updateVendor, getVendorById, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";

export const useVendorForm = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!vendorId;

  // Fetch vendor data for editing
  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendorById(vendorId!),
    enabled: isEditing
  });

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
      navigate("/vendors");
    },
    onError: (error: any) => {
      console.error("Error creating vendor:", error);
      toast.error("Failed to create vendor", {
        description: error.message || "An unexpected error occurred"
      });
    }
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: (data: VendorFormData) => updateVendor(vendorId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
      toast.success("Vendor updated successfully");
      navigate("/vendors");
    },
    onError: (error: any) => {
      console.error("Error updating vendor:", error);
      toast.error("Failed to update vendor", {
        description: error.message || "An unexpected error occurred"
      });
    }
  });

  const handleSubmit = (data: VendorFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    vendor,
    isEditing,
    isLoadingVendor,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    handleSubmit
  };
};
