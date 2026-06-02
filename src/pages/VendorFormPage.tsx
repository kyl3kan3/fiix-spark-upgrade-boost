import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import VendorForm from "@/components/vendors/VendorForm";
import { useVendorForm } from "@/hooks/vendors/useVendorForm";

const VendorFormPage: React.FC = () => {
  const { vendorId } = useParams();
  const isEditing = !!vendorId;

  const {
    vendor,
    isLoadingVendor,
    isSubmitting,
    handleSubmit,
  } = useVendorForm();

  // Convert vendor data to form data format
  const vendorFormData = vendor
    ? {
        name: vendor.name,
        email: vendor.email || "",
        phone: vendor.phone || "",
        contact_person: vendor.contact_person || "",
        contact_title: vendor.contact_title || "",
        vendor_type: vendor.vendor_type as "service" | "supplier" | "contractor" | "consultant",
        status: vendor.status as "active" | "inactive" | "suspended",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        zip_code: vendor.zip_code || "",
        website: vendor.website || "",
        description: vendor.description || "",
        rating: vendor.rating,
      }
    : undefined;

  if (isEditing && isLoadingVendor) {
    return (
      <DashboardLayout>
        <div className="px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>{isEditing ? "Edit Vendor" : "Add New Vendor"} | MaintenEase</title>
      </Helmet>

      <PageHeader
        title={isEditing ? "Edit Vendor" : "Add New Vendor"}
        description={
          isEditing
            ? "Update the details for this vendor."
            : "Create a new vendor profile for your organisation."
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
        <VendorForm
          initialData={vendorFormData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
};

export default VendorFormPage;
