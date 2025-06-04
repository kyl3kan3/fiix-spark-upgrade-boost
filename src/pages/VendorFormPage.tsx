
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendorForm } from "@/hooks/vendors/useVendorForm";
import VendorForm from "@/components/vendors/form/VendorForm";

const VendorFormPage: React.FC = () => {
  const { isEditing, isLoading } = useVendorForm();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <BackToDashboard />
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorFormPage;
