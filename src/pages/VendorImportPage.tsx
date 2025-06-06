
import React, { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { VendorUploader } from '@/components/vendors/VendorUploader'
import { VendorTable } from '@/components/vendors/VendorTable'

const VendorImportPage: React.FC = () => {
  const [parsedVendors, setParsedVendors] = useState<any[]>([])

  const handleVendorsParsed = (vendors: any[]) => {
    setParsedVendors(vendors)
  }

  const handleSaveComplete = () => {
    setParsedVendors([])
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Import Tool</h1>
            <p className="text-gray-600 mt-2">
              Upload PDF or DOCX files to automatically extract vendor information using AI
            </p>
          </div>
        </div>

        <VendorUploader onVendorsParsed={handleVendorsParsed} />
        
        {parsedVendors.length > 0 && (
          <VendorTable 
            vendors={parsedVendors} 
            onSaveComplete={handleSaveComplete}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default VendorImportPage
