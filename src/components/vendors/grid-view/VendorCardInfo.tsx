
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/services/vendorService";
import { getStatusColor, getTypeColor } from "./vendorCardStyles";

interface VendorCardInfoProps {
  vendor: Vendor;
}

const VendorCardInfo: React.FC<VendorCardInfoProps> = ({ vendor }) => {
  return (
    <div className="flex-grow">
      <Link to={`/vendors/edit/${vendor.id}`} className="block">
        <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          {vendor.name}
        </h3>
      </Link>
      
      {vendor.contact_person && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {vendor.contact_person}
        </p>
      )}
      
      <div className="flex items-center gap-2 mt-2">
        {vendor.email && (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Mail className="h-3 w-3 mr-1" />
            <p className="text-xs truncate">{vendor.email}</p>
          </div>
        )}
      </div>
      
      {vendor.phone && (
        <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
          <Phone className="h-3 w-3 mr-1" />
          <p className="text-xs">{vendor.phone}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-3">
        <Badge className={`text-xs font-medium ${getStatusColor(vendor.status)}`}>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </Badge>
        <Badge className={`text-xs font-medium ${getTypeColor(vendor.vendor_type)}`}>
          {vendor.vendor_type.charAt(0).toUpperCase() + vendor.vendor_type.slice(1)}
        </Badge>
      </div>
      
      {vendor.rating && (
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < vendor.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({vendor.rating}/5)</span>
        </div>
      )}
    </div>
  );
};

export default VendorCardInfo;
