
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/shell/PageHeader';
import VendorImport from '@/components/vendors/VendorImport';

const VendorImportPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Import Vendors"
        description="Upload CSV, XLSX, DOCX, or PDF files to import vendor data."
      />
      <div className="px-4 md:px-6 lg:px-8 py-6 w-full max-w-full overflow-hidden">
        <VendorImport />
      </div>
    </DashboardLayout>
  );
};

export default VendorImportPage;
