
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VendorCsvUploader from '@/components/vendors/VendorCsvUploader';
import VendorCsvTable from '@/components/vendors/VendorCsvTable';
import { Button } from '@/components/ui/button';
import { useVendorCsvImport } from '@/hooks/vendors/useVendorCsvImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugVendorPage: React.FC = () => {
  const {
    vendors,
    isImporting,
    handleVendorsUploaded,
    importVendors,
    clearVendors
  } = useVendorCsvImport();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Debug Vendor Import</h1>
            <p className="text-gray-600 mt-2">
              Simplified CSV-based vendor import with detailed debugging
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Expected CSV columns:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>name</code> - Vendor name (required)</li>
                <li><code>email</code> - Contact email</li>
                <li><code>phone</code> - Phone number</li>
                <li><code>address</code> - Street address</li>
                <li><code>city</code> - City</li>
                <li><code>state</code> - State</li>
                <li><code>zip_code</code> - Zip code</li>
                <li><code>contact_person</code> - Contact person name</li>
                <li><code>contact_title</code> - Contact person title</li>
                <li><code>website</code> - Website URL</li>
                <li><code>description</code> - Description or notes</li>
                <li><code>vendor_type</code> - Type (service, supplier, contractor, consultant)</li>
                <li><code>status</code> - Status (active, inactive, suspended)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <VendorCsvUploader onVendors={handleVendorsUploaded} />
        
        {vendors.length > 0 && (
          <>
            <VendorCsvTable vendors={vendors} />
            <div className="flex gap-4">
              <Button 
                onClick={importVendors}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? 'Importing...' : `Import ${vendors.length} Vendors`}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearVendors}
                disabled={isImporting}
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DebugVendorPage;
