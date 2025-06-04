
import React from "react";
import { Edit, Eye, Trash2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Vendor } from "@/services/vendorService";

interface VendorListViewProps {
  vendors: Vendor[] | undefined;
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
}

const VendorListView: React.FC<VendorListViewProps> = ({
  vendors,
  isLoading,
  error,
  hasFilters,
  isDeleting,
  onDeleteVendor,
}) => {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500">Failed to load vendors. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {hasFilters ? "No vendors match your filters" : "No vendors found"}
          </p>
          <p className="text-sm text-gray-400">
            {hasFilters ? "Try adjusting your search criteria" : "Create your first vendor to get started"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {vendors.map((vendor) => (
        <Card key={vendor.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{vendor.name}</h3>
                  <Badge className={getStatusColor(vendor.status)}>
                    {vendor.status}
                  </Badge>
                  <Badge className={getTypeColor(vendor.vendor_type)}>
                    {vendor.vendor_type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                  {vendor.contact_person && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Contact:</span>
                      <span>{vendor.contact_person}</span>
                      {vendor.contact_title && (
                        <span className="text-gray-400">({vendor.contact_title})</span>
                      )}
                    </div>
                  )}
                  
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                  
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                        {vendor.phone}
                      </a>
                    </div>
                  )}
                  
                  {(vendor.city || vendor.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {vendor.rating && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < vendor.rating! ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-gray-600">({vendor.rating}/5)</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {vendor.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {vendor.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link to={`/vendors/${vendor.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/vendors/edit/${vendor.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteVendor(vendor.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VendorListView;
