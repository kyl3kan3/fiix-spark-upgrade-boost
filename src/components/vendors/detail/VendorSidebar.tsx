
import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/services/vendorService";

interface VendorSidebarProps {
  vendor: Vendor;
}

const VendorSidebar: React.FC<VendorSidebarProps> = ({ vendor }) => {
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
  );
};

export default VendorSidebar;
