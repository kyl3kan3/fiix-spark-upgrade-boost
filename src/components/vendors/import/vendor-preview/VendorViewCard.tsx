
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendorImportData } from "@/services/vendorService";
import { Edit3, X } from "lucide-react";

interface VendorViewCardProps {
  vendor: VendorImportData;
  onEdit: () => void;
  onRemove: () => void;
}

export const VendorViewCard: React.FC<VendorViewCardProps> = ({
  vendor,
  onEdit,
  onRemove,
}) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-lg">
            {vendor.name || 'Unnamed Vendor'}
          </h5>
          <Badge variant="outline">{vendor.vendor_type}</Badge>
          {(!vendor.name || vendor.name.length < 3) && (
            <Badge variant="destructive" className="text-xs">Needs Attention</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onRemove}>
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Contact:</span>
          <p>{vendor.contact_person || 'Not specified'}</p>
          <p>{vendor.phone || 'No phone'}</p>
          <p>{vendor.email || 'No email'}</p>
        </div>
        
        <div>
          <span className="font-medium text-muted-foreground">Location:</span>
          <p>{vendor.address || 'No address'}</p>
          <p>{vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : 'No city/state'}</p>
          <p>{vendor.zip_code || ''}</p>
        </div>
        
        <div>
          <span className="font-medium text-muted-foreground">Details:</span>
          <p>Type: {vendor.vendor_type}</p>
          <p>Status: {vendor.status}</p>
          {vendor.website && (
            <p className="truncate">
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                {vendor.website}
              </a>
            </p>
          )}
        </div>
      </div>
      
      {vendor.description && (
        <div className="mt-3 pt-3 border-t">
          <span className="font-medium text-muted-foreground">Description:</span>
          <p className="text-sm mt-1">{vendor.description}</p>
        </div>
      )}
    </div>
  );
};
