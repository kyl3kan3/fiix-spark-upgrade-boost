
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DebugVendorUploader } from '@/components/vendors/DebugVendorUploader';

const DebugVendorPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Debug Vendor Import</h1>
            <p className="text-gray-600 mt-2">
              Simplified vendor parsing with detailed debugging information
            </p>
          </div>
        </div>

        <DebugVendorUploader />
      </div>
    </DashboardLayout>
  );
};

export default DebugVendorPage;
