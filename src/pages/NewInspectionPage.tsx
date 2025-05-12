
import React from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NewInspectionForm from "@/components/inspections/NewInspectionForm";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const NewInspectionPage = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>New Inspection | MaintenEase</title>
      </Helmet>
      
      <BackToDashboard />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Inspection</h1>
        </div>
        
        <NewInspectionForm />
      </div>
    </DashboardLayout>
  );
};

export default NewInspectionPage;
