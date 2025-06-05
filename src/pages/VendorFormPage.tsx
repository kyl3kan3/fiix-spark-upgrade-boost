
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VendorFormPage: React.FC = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!vendorId;

  return (
    <DashboardLayout>
      <Helmet>
        <title>{isEditing ? 'Edit Vendor' : 'Add New Vendor'} | MaintenEase</title>
      </Helmet>
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEditing ? 'Update vendor information' : 'Create a new vendor profile'}
            </p>
          </div>

          {/* Vendor form will be implemented here */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-500 dark:text-gray-400">
              Vendor form component will be implemented here
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorFormPage;
