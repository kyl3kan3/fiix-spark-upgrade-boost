
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getVendorById, createVendor, updateVendor, type VendorFormData } from "@/services/vendorService";
import { vendorSchema, type VendorFormValues } from "@/components/vendors/form/vendorFormSchema";

export const useVendorForm = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(vendorId);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendorById(vendorId!),
    enabled: isEditing,
  });

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      contact_person: "",
      contact_title: "",
      website: "",
      description: "",
      vendor_type: "service",
      status: "active",
      rating: undefined,
    },
  });

  React.useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        email: vendor.email || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        zip_code: vendor.zip_code || "",
        contact_person: vendor.contact_person || "",
        contact_title: vendor.contact_title || "",
        website: vendor.website || "",
        description: vendor.description || "",
        vendor_type: vendor.vendor_type as "service" | "supplier" | "contractor" | "consultant",
        status: vendor.status as "active" | "inactive" | "suspended",
        rating: vendor.rating || undefined,
      });
    }
  }, [vendor, form]);

  const createMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
      navigate("/vendors");
    },
    onError: (error) => {
      toast.error("Failed to create vendor");
      console.error("Error creating vendor:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<VendorFormData>) => updateVendor(vendorId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
      toast.success("Vendor updated successfully");
      navigate("/vendors");
    },
    onError: (error) => {
      toast.error("Failed to update vendor");
      console.error("Error updating vendor:", error);
    },
  });

  const onSubmit = (data: VendorFormValues) => {
    const formattedData: VendorFormData = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      contact_person: data.contact_person || null,
      contact_title: data.contact_title || null,
      website: data.website || null,
      description: data.description || null,
      vendor_type: data.vendor_type,
      status: data.status,
      rating: data.rating || null,
    };

    if (isEditing) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  return {
    form,
    isEditing,
    isLoading,
    onSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    navigate,
  };
};
