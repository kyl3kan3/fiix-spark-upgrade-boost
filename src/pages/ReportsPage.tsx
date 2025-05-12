
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ReportsContent from "../components/features/ReportsContent";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      <ReportsContent />
    </DashboardLayout>
  );
};

export default ReportsPage;
