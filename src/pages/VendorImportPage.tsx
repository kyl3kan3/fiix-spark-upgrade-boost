
import React from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import VendorCsvUploader from '@/components/vendors/VendorCsvUploader'
import VendorCsvTable from '@/components/vendors/VendorCsvTable'
import { Button } from '@/components/ui/button'
import { useVendorCsvImport } from '@/hooks/vendors/useVendorCsvImport'

const VendorImportPage: React.FC = () => {
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
            <h1 className="text-3xl font-bold">Vendor Import Tool</h1>
            <p className="text-gray-600 mt-2">
              Upload CSV files to import vendor information
            </p>
          </div>
        </div>

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
  )
}

export default VendorImportPage
