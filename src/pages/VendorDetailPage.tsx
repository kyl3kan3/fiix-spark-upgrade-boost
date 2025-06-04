
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getVendorById } from "@/services/vendorService";
import VendorDetailHeader from "@/components/vendors/detail/VendorDetailHeader";
import VendorMainInfo from "@/components/vendors/detail/VendorMainInfo";
import VendorSidebar from "@/components/vendors/detail/VendorSidebar";

const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams();

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendorById(vendorId!),
    enabled: Boolean(vendorId),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !vendor) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div>Vendor not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VendorDetailHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <VendorMainInfo vendor={vendor} />
          <VendorSidebar vendor={vendor} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDetailPage;
