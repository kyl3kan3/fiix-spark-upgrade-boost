
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllVendors } from "@/services/vendorService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
    queryFn: getAllVendors,
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

        <div className="grid gap-4">
          {vendors.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No vendors yet</h3>
              <p className="text-gray-500 mt-1">Get started by creating your first vendor.</p>
              <Button asChild className="mt-4">
                <Link to="/vendors/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <p className="text-gray-600 text-sm">{vendor.vendor_type}</p>
                  <p className="text-gray-500 text-sm mt-2">{vendor.email}</p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/vendors/${vendor.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
