import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VendorForm from "@/components/vendors/VendorForm";
import { useVendorForm } from "@/hooks/vendors/useVendorForm";

const VendorFormPage: React.FC = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!vendorId;
  
  const {
    vendor,
    isLoadingVendor,
    isSubmitting,
    handleSubmit
  } = useVendorForm();

  // Convert vendor data to form data format
  const vendorFormData = vendor ? {
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
    rating: vendor.rating
  } : undefined;

  if (isEditing && isLoadingVendor) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>{isEditing ? 'Edit Vendor' : 'Add New Vendor'} | MaintenEase</title>
      </Helmet>
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEditing ? 'Update vendor information' : 'Create a new vendor profile'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <VendorForm
              initialData={vendorFormData}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorFormPage;
