
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Edit, ArrowLeft, Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getVendorById } from "@/services/vendorService";

const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800";
      case "supplier":
        return "bg-purple-100 text-purple-800";
      case "contractor":
        return "bg-orange-100 text-orange-800";
      case "consultant":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/vendors")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{vendor.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                    <Badge className={getTypeColor(vendor.vendor_type)}>
                      {vendor.vendor_type}
                    </Badge>
                  </div>
                </div>
                <Link to={`/vendors/edit/${vendor.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {vendor.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{vendor.description}</p>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.contact_person && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Contact Person</h4>
                      <p>{vendor.contact_person}</p>
                      {vendor.contact_title && (
                        <p className="text-sm text-gray-500">{vendor.contact_title}</p>
                      )}
                    </div>
                  )}

                  {vendor.email && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Email</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                          {vendor.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {vendor.phone && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Phone</h4>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                          {vendor.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {vendor.website && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Website</h4>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {(vendor.address || vendor.city || vendor.state || vendor.zip_code) && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h4>
                      <div className="text-gray-600">
                        {vendor.address && <p>{vendor.address}</p>}
                        {(vendor.city || vendor.state || vendor.zip_code) && (
                          <p>
                            {[vendor.city, vendor.state, vendor.zip_code]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Vendor Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Type</h4>
                  <Badge className={getTypeColor(vendor.vendor_type)}>
                    {vendor.vendor_type}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Status</h4>
                  <Badge className={getStatusColor(vendor.status)}>
                    {vendor.status}
                  </Badge>
                </div>

                {vendor.rating && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Rating</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < vendor.rating! ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {vendor.rating}/5
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(vendor.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDetailPage;
