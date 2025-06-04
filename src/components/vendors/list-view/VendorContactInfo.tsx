
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { type Vendor } from "@/services/vendorService";

interface VendorContactInfoProps {
  vendor: Vendor;
}

const VendorContactInfo: React.FC<VendorContactInfoProps> = ({ vendor }) => {
  return (
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
    </div>
  );
};

export default VendorContactInfo;
