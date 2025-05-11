
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ReportsContent from "../components/features/ReportsContent";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      <ReportsContent />
    </DashboardLayout>
  );
};

export default ReportsPage;
