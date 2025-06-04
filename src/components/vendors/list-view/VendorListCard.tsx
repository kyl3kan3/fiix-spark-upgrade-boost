
import React from "react";
import { Edit, Eye, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { type Vendor } from "@/services/vendorService";
import { getStatusColor, getTypeColor } from "./vendorCardUtils";
import VendorContactInfo from "./VendorContactInfo";
import VendorRating from "./VendorRating";

interface VendorListCardProps {
  vendor: Vendor;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
  selectedVendors: string[];
  onVendorSelection?: (vendorId: string, selected: boolean) => void;
}

const VendorListCard: React.FC<VendorListCardProps> = ({
  vendor,
  isDeleting,
  onDeleteVendor,
  selectedVendors,
  onVendorSelection,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            {onVendorSelection && (
              <div className="mt-1">
                <Checkbox
                  checked={selectedVendors.includes(vendor.id)}
                  onCheckedChange={(checked) => onVendorSelection(vendor.id, !!checked)}
                />
              </div>
            )}
            
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
              
              <VendorContactInfo vendor={vendor} />
              <VendorRating vendor={vendor} />
              
              {vendor.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {vendor.description}
                </p>
              )}
            </div>
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
  );
};

export default VendorListCard;
