
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ReportsContent from "../components/features/ReportsContent";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Helmet } from "react-helmet";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Reports & Analytics | MaintenEase</title>
      </Helmet>
      <BackToDashboard />
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>
      <ReportsContent />
    </DashboardLayout>
  );
};

export default ReportsPage;
