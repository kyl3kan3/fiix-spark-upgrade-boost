
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VendorImportData } from '@/services/vendorService';

interface SavePreviewTabProps {
  vendors: VendorImportData[];
}

export const SavePreviewTab: React.FC<SavePreviewTabProps> = ({ vendors }) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatVendorForSave = (vendor: VendorImportData) => {
    return {
      name: vendor.name || 'Unnamed Vendor',
      email: vendor.email || null,
      phone: vendor.phone || null,
      contact_person: vendor.contact_person || null,
      contact_title: vendor.contact_title || null,
      vendor_type: vendor.vendor_type || 'service',
      status: vendor.status || 'active',
      address: vendor.address || null,
      city: vendor.city || null,
      state: vendor.state || null,
      zip_code: vendor.zip_code || null,
      website: vendor.website || null,
      description: vendor.description || null,
      rating: vendor.rating || null,
    };
  };

  const formattedVendors = vendors.map(formatVendorForSave);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Database Save Preview</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showPreview ? 'Hide' : 'Show'} JSON Preview
        </Button>
      </div>
      
      {showPreview && (
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(formattedVendors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4">
        {formattedVendors.map((vendor, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-lg">
                  {vendor.name}
                </h5>
                <Badge variant="outline">{vendor.vendor_type}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Contact Info:</span>
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
                  <p>Status: {vendor.status}</p>
                  <p>Type: {vendor.vendor_type}</p>
                  {vendor.website && (
                    <p className="truncate">
                      Website: {vendor.website}
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
