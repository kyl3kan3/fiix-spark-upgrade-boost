
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VendorImport from '@/components/vendors/VendorImport';
import BackToDashboard from '@/components/dashboard/BackToDashboard';

const VendorImportPage: React.FC = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Vendors</h1>
          <p className="text-muted-foreground">
            Upload CSV, XLSX, DOCX, or PDF files to import vendor data
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <VendorImport />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorImportPage;
