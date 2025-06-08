
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VendorImport from '@/components/vendors/VendorImport';
import BackToDashboard from '@/components/dashboard/BackToDashboard';

const VendorImportPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-hidden">
        <BackToDashboard />
        <div className="space-y-6 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Vendors</h1>
            <p className="text-muted-foreground">
              Upload CSV, XLSX, DOCX, or PDF files to import vendor data
            </p>
          </div>
          
          <div className="w-full max-w-full">
            <div className="bg-white p-6 rounded-lg border shadow-sm w-full overflow-hidden">
              <VendorImport />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorImportPage;
