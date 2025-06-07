
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/services/vendorService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorList from "@/components/vendors/VendorList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const VendorsPage = () => {
  const {
    data: vendors = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading vendors...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Error loading vendors: {error.message}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground">
              Manage your vendor relationships and contacts
            </p>
          </div>
          <Button asChild>
            <Link to="/vendors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Link>
          </Button>
        </div>

        <VendorList vendors={vendors} />
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
